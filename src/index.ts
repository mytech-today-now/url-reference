/**
 * @mytechtoday/url-reference-mapper
 *
 * Bidirectional mapping between local filesystem paths and published internet URLs
 * for Augment AI workflows, OpenSpec, and beads integration.
 */

export { UrlReferenceMapper } from './UrlReferenceMapper';
export {
  UrlMapping,
  UrlReferenceMapperConfig,
  MapperConfig,
  ValidationResult,
  ValidationError,
  ValidationErrorType,
  ValidationWarning,
  ValidationWarningType,
  ExportFormat,
} from './types';

// Helper functions for beads tasks and Augment AI workflows
export {
  convertLocalLinksToPublished,
  convertPublishedLinksToLocal,
  batchConvertPathsToUrls,
  batchConvertUrlsToPaths,
} from './helpers';

// JSON Schema for OpenSpec and API documentation
export {
  UrlMappingSchema,
  getSchemaAsString,
  getSchemaDefinition,
  listSchemaDefinitions,
} from './schema';

// Package version
export { VERSION } from './version';
