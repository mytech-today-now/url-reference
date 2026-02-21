import * as fs from 'fs';
import * as path from 'path';
import { ValidationResult, ValidationError, ValidationWarning } from '../types';

/**
 * Configuration options for path validation
 */
export interface PathValidatorConfig {
  /** Base directory for path traversal prevention */
  basePath?: string;
  /** Allowed file extensions (default: ['.md', '.html', '.htm', '.txt']) */
  allowedExtensions?: string[];
  /** Whether to check file permissions (default: true) */
  checkPermissions?: boolean;
  /** Whether to enforce absolute paths (default: false) */
  requireAbsolute?: boolean;
}

/**
 * Validator for file paths
 */
export class PathValidator {
  private config: Required<PathValidatorConfig>;

  constructor(config: PathValidatorConfig = {}) {
    this.config = {
      basePath: config.basePath ?? '',
      allowedExtensions: config.allowedExtensions ?? ['.md', '.markdown', '.html', '.htm', '.txt'],
      checkPermissions: config.checkPermissions ?? true,
      requireAbsolute: config.requireAbsolute ?? false,
    };
  }

  /**
   * Validate a file path
   * 
   * @param filePath - Path to validate
   * @returns Validation result with errors and warnings
   */
  validate(filePath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if path is empty or null
    if (!filePath || filePath.trim() === '') {
      errors.push({
        type: 'invalid_format',
        message: 'Path cannot be empty',
      });
      return { valid: false, errors, warnings };
    }

    // Check if path is absolute (warning if required)
    const isAbsolute = path.isAbsolute(filePath);
    if (this.config.requireAbsolute && !isAbsolute) {
      errors.push({
        type: 'invalid_format',
        message: `Path must be absolute: ${filePath}`,
      });
    } else if (!isAbsolute) {
      warnings.push({
        type: 'relative_path',
        message: `Relative path detected (absolute paths recommended): ${filePath}`,
      });
    }

    // Resolve path for further checks
    const resolvedPath = path.resolve(filePath);

    // Check for path traversal
    if (this.config.basePath) {
      const normalizedBase = path.normalize(this.config.basePath);
      const normalizedPath = path.normalize(resolvedPath);
      
      if (!normalizedPath.startsWith(normalizedBase)) {
        errors.push({
          type: 'invalid_format',
          message: `Path traversal detected: ${filePath} is outside base directory ${this.config.basePath}`,
        });
      }
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      warnings.push({
        type: 'missing_file',
        message: `File not found: ${filePath}`,
      });
      // Don't continue with further checks if file doesn't exist
      return { valid: errors.length === 0, errors, warnings };
    }

    // Check if it's a file (not a directory)
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      errors.push({
        type: 'invalid_format',
        message: `Path is not a file: ${filePath}`,
      });
      return { valid: errors.length === 0, errors, warnings };
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (this.config.allowedExtensions.length > 0 && !this.config.allowedExtensions.includes(ext)) {
      errors.push({
        type: 'invalid_format',
        message: `Invalid file type: ${ext}. Allowed types: ${this.config.allowedExtensions.join(', ')}`,
      });
    }

    // Check file permissions
    if (this.config.checkPermissions) {
      try {
        fs.accessSync(resolvedPath, fs.constants.R_OK);
      } catch (error) {
        errors.push({
          type: 'invalid_format',
          message: `File is not readable: ${filePath}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate multiple paths
   * 
   * @param paths - Array of paths to validate
   * @returns Array of validation results
   */
  validateBatch(paths: string[]): Array<{ path: string; result: ValidationResult }> {
    return paths.map((filePath) => ({
      path: filePath,
      result: this.validate(filePath),
    }));
  }
}

