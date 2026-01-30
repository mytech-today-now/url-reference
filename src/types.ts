/**
 * Represents a single URL-to-path mapping entry
 */
export interface UrlMapping {
  /** Human-readable title for the mapping */
  title: string;
  /** Published URL */
  url: string;
  /** Local filesystem path */
  localPath: string;
  /** ISO 8601 timestamp of last update */
  lastUpdated?: string;
  /** Optional additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration options for UrlReferenceMapper
 */
export interface UrlReferenceMapperConfig {
  /** Path to configuration file (JSON or YAML) */
  configPath?: string;
  /** Inline mappings (for testing or small projects) */
  mappings?: UrlMapping[];
  /** Auto-save changes to config file */
  autoSave?: boolean;
  /** Validate mappings when loading (default: true) */
  validateOnLoad?: boolean;
  /** Allow duplicate URLs or paths (default: false) */
  allowDuplicates?: boolean;
}

/**
 * Type alias for MapperConfig (matches OpenSpec naming)
 */
export type MapperConfig = UrlReferenceMapperConfig;

/**
 * Validation error types
 */
export type ValidationErrorType =
  | 'duplicate_url'
  | 'duplicate_path'
  | 'invalid_url'
  | 'missing_file'
  | 'invalid_format';

/**
 * Validation warning types
 */
export type ValidationWarningType =
  | 'outdated_timestamp'
  | 'relative_path'
  | 'missing_metadata'
  | 'missing_file';

/**
 * Validation error details
 */
export interface ValidationError {
  /** Error type */
  type: ValidationErrorType;
  /** Human-readable error message */
  message: string;
  /** The mapping that caused the error (optional) */
  mapping?: UrlMapping;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  /** Warning type */
  type: ValidationWarningType;
  /** Human-readable warning message */
  message: string;
  /** The mapping that caused the warning (optional) */
  mapping?: UrlMapping;
}

/**
 * Validation result for mappings
 */
export interface ValidationResult {
  /** Whether all mappings are valid */
  valid: boolean;
  /** Validation errors, if any */
  errors: ValidationError[];
  /** Validation warnings, if any */
  warnings: ValidationWarning[];
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'yaml' | 'csv';

