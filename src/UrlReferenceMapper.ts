import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  UrlMapping,
  UrlReferenceMapperConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ExportFormat,
} from './types';
import { extractMetadata, ExtractedMetadata, ExtractionConfig } from './extractors';

/**
 * Main class for managing bidirectional URL-to-path mappings
 */
export class UrlReferenceMapper {
  private mappings: UrlMapping[] = [];
  private urlToMapping: Map<string, UrlMapping> = new Map();
  private pathToMapping: Map<string, UrlMapping> = new Map();
  private configPath?: string;
  private autoSave: boolean;
  private validateOnLoad: boolean;
  private allowDuplicates: boolean;

  constructor(config: UrlReferenceMapperConfig = {}) {
    this.configPath = config.configPath;
    this.autoSave = config.autoSave ?? false;
    this.validateOnLoad = config.validateOnLoad ?? true;
    this.allowDuplicates = config.allowDuplicates ?? false;

    if (config.mappings) {
      this.mappings = config.mappings;
      this.rebuildIndexes();
    } else if (config.configPath) {
      this.loadFromFile(config.configPath);
    }

    // Validate on load if enabled
    if (this.validateOnLoad && this.mappings.length > 0) {
      const validationResult = this.validate();
      if (!validationResult.valid) {
        throw new Error(
          `Validation failed on load:\n` +
            validationResult.errors.map((e) => `  - [${e.type}] ${e.message}`).join('\n')
        );
      }
    }
  }

  /**
   * Rebuild the lookup indexes from the mappings array
   */
  private rebuildIndexes(): void {
    this.urlToMapping.clear();
    this.pathToMapping.clear();

    for (const mapping of this.mappings) {
      this.urlToMapping.set(mapping.url, mapping);
      const normalizedPath = path.normalize(mapping.localPath);
      this.pathToMapping.set(normalizedPath, mapping);
    }
  }

  /**
   * Load mappings from a configuration file (JSON or YAML)
   */
  private loadFromFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Configuration file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.json') {
      this.mappings = JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      this.mappings = yaml.load(content) as UrlMapping[];
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json, .yaml, or .yml`);
    }

    this.rebuildIndexes();
  }

  /**
   * Get published URL from local path (O(1) lookup)
   */
  getUrlFromLocalPath(localPath: string): string | null {
    const normalized = path.normalize(localPath);
    const mapping = this.pathToMapping.get(normalized);
    return mapping ? mapping.url : null;
  }

  /**
   * Get local path from published URL (O(1) lookup)
   */
  getLocalPathFromUrl(url: string): string | null {
    const mapping = this.urlToMapping.get(url);
    return mapping ? mapping.localPath : null;
  }

  /**
   * Add a new mapping
   */
  addMapping(mapping: UrlMapping): void {
    // Check for duplicates (unless allowDuplicates is enabled)
    if (!this.allowDuplicates) {
      const normalizedPath = path.normalize(mapping.localPath);

      if (this.urlToMapping.has(mapping.url)) {
        throw new Error(`URL already exists: ${mapping.url}`);
      }
      if (this.pathToMapping.has(normalizedPath)) {
        throw new Error(`Local path already exists: ${mapping.localPath}`);
      }
    }

    // Add timestamp if not provided
    if (!mapping.lastUpdated) {
      mapping.lastUpdated = new Date().toISOString();
    }

    this.mappings.push(mapping);

    // Update indexes
    this.urlToMapping.set(mapping.url, mapping);
    const normalizedPath = path.normalize(mapping.localPath);
    this.pathToMapping.set(normalizedPath, mapping);

    if (this.autoSave && this.configPath) {
      this.save();
    }
  }

  /**
   * Update an existing mapping
   */
  updateMapping(url: string, updates: Partial<UrlMapping>): void {
    const mapping = this.urlToMapping.get(url);
    if (!mapping) {
      throw new Error(`Mapping not found for URL: ${url}`);
    }

    // Remove old path index if path is being updated
    if (updates.localPath && updates.localPath !== mapping.localPath) {
      const oldNormalizedPath = path.normalize(mapping.localPath);
      this.pathToMapping.delete(oldNormalizedPath);
    }

    // Update the mapping
    const updatedMapping = {
      ...mapping,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    // Update in array
    const index = this.mappings.findIndex((m) => m.url === url);
    if (index !== -1) {
      this.mappings[index] = updatedMapping;
    }

    // Update indexes
    this.urlToMapping.set(url, updatedMapping);
    const newNormalizedPath = path.normalize(updatedMapping.localPath);
    this.pathToMapping.set(newNormalizedPath, updatedMapping);

    if (this.autoSave && this.configPath) {
      this.save();
    }
  }

  /**
   * Remove a mapping by URL
   */
  removeMapping(url: string): boolean {
    const mapping = this.urlToMapping.get(url);
    if (!mapping) {
      return false;
    }

    // Remove from array
    this.mappings = this.mappings.filter((m) => m.url !== url);

    // Remove from indexes
    this.urlToMapping.delete(url);
    const normalizedPath = path.normalize(mapping.localPath);
    this.pathToMapping.delete(normalizedPath);

    if (this.autoSave && this.configPath) {
      this.save();
    }

    return true;
  }

  /**
   * Get a mapping by URL
   */
  getMapping(url: string): UrlMapping | null {
    return this.urlToMapping.get(url) || null;
  }

  /**
   * Get all mappings
   */
  getAllMappings(): UrlMapping[] {
    return [...this.mappings];
  }

  /**
   * Save mappings to the configured file
   */
  save(filePath?: string): void {
    const targetPath = filePath || this.configPath;
    if (!targetPath) {
      throw new Error('No file path specified for saving');
    }

    const ext = path.extname(targetPath).toLowerCase();
    let content: string;

    if (ext === '.json') {
      content = JSON.stringify(this.mappings, null, 2);
    } else if (ext === '.yaml' || ext === '.yml') {
      content = yaml.dump(this.mappings);
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json, .yaml, or .yml`);
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
  }

  /**
   * Validate all mappings
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for duplicate URLs
    const urls = new Set<string>();
    const paths = new Set<string>();

    for (const mapping of this.mappings) {
      // Validate required fields
      if (!mapping.title || !mapping.url || !mapping.localPath) {
        errors.push({
          type: 'invalid_format',
          message: `Missing required fields in mapping: ${JSON.stringify(mapping)}`,
          mapping,
        });
        continue;
      }

      // Check for duplicate URLs
      if (urls.has(mapping.url)) {
        errors.push({
          type: 'duplicate_url',
          message: `Duplicate URL found: ${mapping.url}`,
          mapping,
        });
      }
      urls.add(mapping.url);

      // Check for duplicate paths
      const normalizedPath = path.normalize(mapping.localPath);
      if (paths.has(normalizedPath)) {
        errors.push({
          type: 'duplicate_path',
          message: `Duplicate local path found: ${mapping.localPath}`,
          mapping,
        });
      }
      paths.add(normalizedPath);

      // Validate URL format
      try {
        new URL(mapping.url);
      } catch {
        errors.push({
          type: 'invalid_url',
          message: `Invalid URL format: ${mapping.url}`,
          mapping,
        });
      }

      // Check if local file exists (warning only)
      if (!fs.existsSync(mapping.localPath)) {
        warnings.push({
          type: 'missing_file',
          message: `Local file not found: ${mapping.localPath}`,
          mapping,
        });
      }

      // Check for relative paths (warning)
      if (!path.isAbsolute(mapping.localPath)) {
        warnings.push({
          type: 'relative_path',
          message: `Relative path detected (absolute paths recommended): ${mapping.localPath}`,
          mapping,
        });
      }

      // Check for missing metadata (warning)
      if (!mapping.metadata || Object.keys(mapping.metadata).length === 0) {
        warnings.push({
          type: 'missing_metadata',
          message: `Missing metadata for mapping: ${mapping.title}`,
          mapping,
        });
      }

      // Check for outdated timestamp (warning)
      if (mapping.lastUpdated) {
        const lastUpdated = new Date(mapping.lastUpdated);
        const now = new Date();
        const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 90) {
          warnings.push({
            type: 'outdated_timestamp',
            message: `Mapping not updated in ${Math.floor(daysDiff)} days: ${mapping.title}`,
            mapping,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Export mappings to different formats
   */
  export(format: ExportFormat): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.mappings, null, 2);

      case 'yaml':
        return yaml.dump(this.mappings);

      case 'csv': {
        const headers = 'Title,URL,Local Path,Last Updated\n';
        const rows = this.mappings
          .map((m) => `"${m.title}","${m.url}","${m.localPath}","${m.lastUpdated || ''}"`)
          .join('\n');
        return headers + rows;
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Extract metadata from a document file
   *
   * @param filePath - Path to the document file
   * @param config - Optional extraction configuration
   * @returns Extracted metadata
   */
  async extractMetadataFromFile(
    filePath: string,
    config?: ExtractionConfig
  ): Promise<ExtractedMetadata> {
    return extractMetadata(filePath, config);
  }

  /**
   * Add a mapping with automatic metadata extraction
   *
   * @param url - Published URL
   * @param localPath - Local filesystem path
   * @param title - Title for the mapping
   * @param config - Optional extraction configuration
   */
  async addMappingWithExtraction(
    url: string,
    localPath: string,
    title: string,
    config?: ExtractionConfig
  ): Promise<void> {
    // Extract metadata from the file
    const metadata = await this.extractMetadataFromFile(localPath, config);

    // Create the mapping with extracted metadata
    const mapping: UrlMapping = {
      title,
      url,
      localPath,
      lastUpdated: new Date().toISOString(),
      ...metadata,
    };

    this.addMapping(mapping);
  }

  /**
   * Update a mapping with fresh metadata extraction
   *
   * @param url - URL of the mapping to update
   * @param config - Optional extraction configuration
   */
  async updateMappingWithExtraction(
    url: string,
    config?: ExtractionConfig
  ): Promise<void> {
    const mapping = this.urlToMapping.get(url);
    if (!mapping) {
      throw new Error(`Mapping not found for URL: ${url}`);
    }

    // Extract fresh metadata
    const metadata = await this.extractMetadataFromFile(mapping.localPath, config);

    // Update the mapping
    this.updateMapping(url, metadata);
  }
}
