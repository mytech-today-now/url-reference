/**
 * Schema Migration Utilities
 * Task: uur-1-5-m6u (hel.1.2)
 * 
 * Provides utilities to migrate v1.0 configurations to v2.0 format automatically.
 * Includes auto-migration on config load, backup creation, and validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { UrlMapping } from '../types';

/**
 * Configuration file structure (v1.0 and v2.0)
 */
export interface UrlReferenceConfig {
  version?: string;
  mappings: UrlMapping[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Migration result with details
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  warnings: string[];
  backupPath?: string;
}

/**
 * Detect if a configuration is v1.0 format
 * 
 * @param config - Configuration object to check
 * @returns True if v1.0 format, false otherwise
 */
export function isV1Config(config: any): boolean {
  // v1.0 doesn't have a version field or has version "1.0.0"
  if (!config.version || config.version === '1.0.0') {
    return true;
  }
  return false;
}

/**
 * Migrate a single v1.0 mapping to v2.0 format
 * 
 * @param mapping - v1.0 mapping
 * @returns v2.0 mapping
 */
export function migrateMappingV1ToV2(mapping: any): UrlMapping {
  const migrated: UrlMapping = {
    title: mapping.title,
    url: mapping.url,
    localPath: mapping.localPath,
    lastUpdated: mapping.lastUpdated || new Date().toISOString(),
  };

  // Extract metadata object properties to specific fields
  if (mapping.metadata) {
    const meta = mapping.metadata;
    
    // Map known metadata properties to v2.0 fields
    if (meta.wordCount !== undefined) migrated.wordCount = meta.wordCount;
    if (meta.readingTime !== undefined) migrated.readingTime = meta.readingTime;
    if (meta.tags !== undefined) migrated.tags = meta.tags;
    if (meta.summary !== undefined) migrated.summary = meta.summary;
    if (meta.tldr !== undefined) migrated.tldr = meta.tldr;
    if (meta.categories !== undefined) migrated.categories = meta.categories;
    if (meta.author !== undefined) migrated.author = meta.author;
    if (meta.featuredImages !== undefined) migrated.featuredImages = meta.featuredImages;
    if (meta.authorImage !== undefined) migrated.authorImage = meta.authorImage;
    if (meta.authorUrl !== undefined) migrated.authorUrl = meta.authorUrl;
    if (meta.quotes !== undefined) migrated.quotes = meta.quotes;
    if (meta.internalLinks !== undefined) migrated.internalLinks = meta.internalLinks;
    if (meta.externalLinks !== undefined) migrated.externalLinks = meta.externalLinks;
    if (meta.relatedPosts !== undefined) migrated.relatedPosts = meta.relatedPosts;
    
    // Keep any unknown metadata in the metadata field
    const knownKeys = [
      'wordCount', 'readingTime', 'tags', 'summary', 'tldr', 'categories',
      'author', 'featuredImages', 'authorImage', 'authorUrl', 'quotes',
      'internalLinks', 'externalLinks', 'relatedPosts'
    ];
    const unknownMeta: Record<string, any> = {};
    for (const key in meta) {
      if (!knownKeys.includes(key)) {
        unknownMeta[key] = meta[key];
      }
    }
    if (Object.keys(unknownMeta).length > 0) {
      migrated.metadata = unknownMeta;
    }
  }

  return migrated;
}

/**
 * Migrate v1.0 configuration to v2.0 format
 * 
 * @param v1Config - v1.0 configuration object
 * @returns v2.0 configuration object
 */
export function migrateV1ToV2(v1Config: any): UrlReferenceConfig {
  const migratedMappings = v1Config.mappings.map(migrateMappingV1ToV2);

  return {
    version: '2.0.0',
    mappings: migratedMappings,
    metadata: {
      createdAt: v1Config.metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Create a backup of a configuration file
 * 
 * @param filePath - Path to the configuration file
 * @param backupDir - Directory to store backups (default: ./.backups/)
 * @returns Path to the backup file
 */
export function createBackup(filePath: string, backupDir: string = './.backups'): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Generate backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const basename = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath);
  const backupFilename = `${basename}-backup-${timestamp}${ext}`;
  const backupPath = path.join(backupDir, backupFilename);

  // Copy file to backup location
  fs.copyFileSync(filePath, backupPath);

  return backupPath;
}

/**
 * Migrate a configuration file from v1.0 to v2.0
 *
 * @param inputPath - Path to the v1.0 configuration file
 * @param outputPath - Path to save the v2.0 configuration file
 * @param options - Migration options
 * @returns Migration result with details
 */
export function migrateConfigFile(
  inputPath: string,
  outputPath: string,
  options: { backup?: boolean; backupDir?: string } = {}
): MigrationResult {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      result.errors.push(`Input file not found: ${inputPath}`);
      return result;
    }

    // Read and parse input file
    const content = fs.readFileSync(inputPath, 'utf-8');
    let config: any;

    try {
      config = JSON.parse(content);
    } catch (error) {
      result.errors.push(`Failed to parse JSON: ${(error as Error).message}`);
      return result;
    }

    // Check if already v2.0
    if (!isV1Config(config)) {
      result.warnings.push('Configuration is already v2.0 format');
      result.success = true;
      return result;
    }

    // Create backup if requested
    if (options.backup !== false) {
      try {
        const backupPath = createBackup(inputPath, options.backupDir);
        result.backupPath = backupPath;
      } catch (error) {
        result.warnings.push(`Backup creation failed: ${(error as Error).message}`);
      }
    }

    // Migrate configuration
    const migratedConfig = migrateV1ToV2(config);
    result.migratedCount = migratedConfig.mappings.length;

    // Write migrated configuration
    fs.writeFileSync(outputPath, JSON.stringify(migratedConfig, null, 2), 'utf-8');

    result.success = true;
  } catch (error) {
    result.errors.push(`Migration failed: ${(error as Error).message}`);
  }

  return result;
}

/**
 * Auto-migrate configuration on load if needed
 *
 * @param config - Configuration object
 * @returns Migrated configuration if v1.0, otherwise original
 */
export function autoMigrateConfig(config: any): UrlReferenceConfig {
  if (isV1Config(config)) {
    return migrateV1ToV2(config);
  }
  return config;
}

/**
 * Clean up old backups, keeping only the most recent N backups
 *
 * @param backupDir - Directory containing backups
 * @param maxBackups - Maximum number of backups to keep (default: 5)
 */
export function cleanupOldBackups(backupDir: string = './.backups', maxBackups: number = 5): void {
  if (!fs.existsSync(backupDir)) {
    return;
  }

  // Get all backup files
  const files = fs.readdirSync(backupDir)
    .filter(f => f.includes('-backup-'))
    .map(f => ({
      name: f,
      path: path.join(backupDir, f),
      mtime: fs.statSync(path.join(backupDir, f)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  // Delete old backups
  if (files.length > maxBackups) {
    const toDelete = files.slice(maxBackups);
    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
    });
  }
}

