# URL Reference Package Specification

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2026-01-30

## Overview

A standalone, reusable npm package (`@mytechtoday/url-reference`) that provides bidirectional mapping between local filesystem paths and published internet URLs. This package serves as the canonical reference system for Augment AI-generated projects, eliminating broken local-file links in generated content when published to the web.

## Goals

- Create a production-ready, independently versioned npm module
- Allow any developer using Augment AI workflows to depend on this package instead of copying reference files or logic manually
- Provide simple APIs for URL/path lookups and mapping management
- Support human-editable configuration files (JSON/YAML)
- Include CLI helper commands for common tasks
- Ship with TypeScript declarations
- Be MIT-licensed (or equivalent permissive license)

## Non-Goals (Out of Scope for v1.0)

- Automatic detection/watching of filesystem changes
- Remote synchronization (e.g., fetching latest mappings from a central server)
- GUI editor
- Support for non-file URLs (dynamic routes, API endpoints)

## Core Capabilities

### 1. Core Library API

**Requirements:**
- Provide a `UrlReferenceMapper` class as the main entry point
- Support both file-based configuration and inline mappings
- Synchronous lookup operations for performance
- Bidirectional mapping (URL ↔ local path)
- CRUD operations for mappings
- Validation of mappings
- Persistence to configuration files

**API Surface:**

```typescript
class UrlReferenceMapper {
  constructor(config: MapperConfig)
  
  // Lookup operations
  getUrlFromLocalPath(localPath: string): string | null
  getLocalPathFromUrl(url: string): string | null
  getAllMappings(): UrlMapping[]
  
  // CRUD operations
  addMapping(mapping: UrlMapping): void
  updateMapping(identifier: string, mapping: UrlMapping): void
  removeMapping(identifier: string): void
  
  // Validation & persistence
  validate(): ValidationResult
  save(): void
  export(format: 'json' | 'yaml' | 'csv'): string
}
```

**Configuration Options:**

```typescript
interface MapperConfig {
  configPath?: string;              // Path to JSON/YAML config file
  mappings?: UrlMapping[];          // Inline mappings (alternative to configPath)
  autoSave?: boolean;               // Auto-save on changes (default: false)
  validateOnLoad?: boolean;         // Validate on load (default: true)
  allowDuplicates?: boolean;        // Allow duplicate URLs/paths (default: false)
}
```

**Data Model:**

```typescript
interface UrlMapping {
  title: string;                    // Human-readable title
  url: string;                      // Published internet URL
  localPath: string;                // Local filesystem path (absolute or relative)
  lastUpdated?: string;             // ISO 8601 timestamp
  metadata?: Record<string, any>;   // Optional additional metadata
}
```

### 2. Configuration File Formats

**Requirements:**
- Auto-detect format based on file extension
- Support JSON as the primary format
- Support YAML as an alternative
- Optional CSV support for bulk import/export

**File Formats:**
- `url-references.json` (recommended default)
- `url-references.yaml` / `url-references.yml`
- `url-references.csv` (export/import only)

**Example JSON Structure:**

```json
[
  {
    "title": "Copper ETFs and Investment Vehicles: 2026",
    "url": "https://mytech.today/copper-etfs-and-investment-vehicles-2026/",
    "localPath": "G:\\_kyle\\temp_documents\\GitHub\\mytechtoday\\blogs\\copper-mining-part-4-etf-investment-vehicles.html",
    "lastUpdated": "2026-01-27T17:04:00-06:00"
  }
]
```

### 3. CLI Commands

**Requirements:**
- Provide a `url-ref-mapper` CLI binary
- Support all core operations via command line
- Provide helpful error messages and usage information
- Support both interactive and scriptable usage

**Commands:**

```bash
# Initialize new config file
npx url-ref-mapper init [--format json|yaml] [--output <path>]

# Add new mapping
npx url-ref-mapper add --title <title> --url <url> --path <path>

# Lookup operations
npx url-ref-mapper get-url <localPath>
npx url-ref-mapper get-path <url>

# List all mappings
npx url-ref-mapper list [--format table|json|yaml]

# Validate mappings
npx url-ref-mapper validate [--config <path>]

# Export mappings
npx url-ref-mapper export --format <format> [--output <path>]
```

### 4. Integration with Augment AI / OpenSpec / beads

**Requirements:**
- Export helper functions callable from beads tasks
- Provide JSON Schema definition for OpenSpec documents
- Include usage examples for Augmentcode AI prompt patterns
- No hard-coded `.augment/` paths (must be configurable)

**Integration Points:**

```typescript
// Helper function for beads tasks
export function convertLocalLinksToPublished(
  content: string, 
  configPath: string
): string;

// Schema export for OpenSpec
export const UrlMappingSchema: JSONSchema;
```

### 5. Seed Data

**Requirements:**
- Include initial reference mappings for copper mining blog posts
- Make seed data easily importable
- Provide as default example in documentation

**Seed Mappings:**

| Title | URL | Local Path |
|-------|-----|------------|
| Copper ETFs and Investment Vehicles: 2026 | https://mytech.today/copper-etfs-and-investment-vehicles-2026/ | G:\_kyle\temp_documents\GitHub\mytechtoday\blogs\copper-mining-part-4-etf-investment-vehicles.html |
| Mid-Tier & Junior Copper Miners: 2026 Analysis | https://mytech.today/mid-tier-junior-copper-miners-2026-analysis/ | G:\_kyle\temp_documents\GitHub\mytechtoday\blogs\copper-mining-part-3-mid-tier-junior-companies.html |
| Copper Demand vs Supply: 2026-2040 Outlook | https://mytech.today/copper-demand-vs-supply-2026-2040-outlook/ | G:\_kyle\temp_documents\GitHub\mytechtoday\blogs\copper-mining-part-1-demand-supply-outlook.html |
| Major Copper Mining Companies Analysis 2026 | https://mytech.today/major-copper-mining-companies-analysis-2026/ | G:\_kyle\temp_documents\GitHub\mytechtoday\blogs\copper-mining-part-2-major-companies-analysis.html |

## Validation Rules

### Error Conditions
- **duplicate_url**: Multiple mappings with the same URL
- **duplicate_path**: Multiple mappings with the same local path
- **invalid_url**: Malformed URL format
- **missing_file**: Local path does not exist on filesystem
- **invalid_format**: Mapping object missing required fields

### Warning Conditions
- **outdated_timestamp**: lastUpdated is more than 90 days old
- **relative_path**: Local path is relative (absolute paths recommended)
- **missing_metadata**: Optional metadata field is empty

## Package Structure

```
@mytechtoday/url-reference/
├── src/
│   ├── index.ts                    # Main exports
│   ├── UrlReferenceMapper.ts       # Core class
│   ├── types.ts                    # TypeScript interfaces
│   ├── cli.ts                      # CLI implementation
│   └── __tests__/                  # Unit tests
├── dist/                           # Compiled output
├── schema.json                     # JSON Schema export
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Dependencies

**Runtime:**
- `commander` - CLI argument parsing
- `js-yaml` - YAML file support

**Development:**
- `typescript` - TypeScript compiler
- `jest` / `vitest` - Testing framework
- `eslint` - Linting
- `prettier` - Code formatting

## Acceptance Criteria

- [ ] Package installs successfully via `npm install @mytechtoday/url-reference`
- [ ] All core lookup/add/save operations function correctly
- [ ] CLI commands execute without errors and produce expected output
- [ ] Seed copper blog mappings are included or easily importable
- [ ] README contains clear examples for Augment AI / OpenSpec / beads workflows
- [ ] Package does not depend on any specific project structure
- [ ] Published version ≥ 1.0.0 contains all features above
- [ ] TypeScript declarations are included and accurate
- [ ] Unit tests achieve >80% code coverage
- [ ] GitHub Actions CI pipeline runs successfully

## Related Tickets

- **AUG-456**: Create standalone npm package @mytechtoday/url-reference (this spec)
- **AUG-457**: Migrate author's .augment/ directory to depend on @mytechtoday/url-reference
- **AUG-458**: Update OpenSpec schema references to point to this package's schema

## References

- Source Requirements: `ai-prompts/url-reference.md`
- OpenAPI Specification: `openapi-spec.yaml`
- Package Repository: https://github.com/mytechtoday/url-reference
- NPM Package: https://www.npmjs.com/package/@mytechtoday/url-reference

