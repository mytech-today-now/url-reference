# URL Reference Mapper Enhancement - Bead Tasks (hel.x.y.z)

This file contains all bead tasks for the URL Reference Mapper Enhancement project based on the OpenSpec documentation in `openspec/changes/update-url-reference/`.

**Task ID Format:** `hel.x.y.z`
- `hel` = URL Reference Mapper Enhancement
- `x` = Phase number
- `y` = Task number within phase
- `z` = Subtask number (if applicable)

---

## Epic: URL Reference Mapper Enhancement v2.0

**ID:** hel.0  
**Type:** epic  
**Priority:** P1  
**Estimate:** 11100 minutes (185 hours)  
**Description:**

Transform the URL Reference Mapper from a simple URL/path mapper into a complete content intelligence system with rich metadata extraction, comprehensive CLI tooling, and AI-ready features.

**Key Objectives:**
- Rich metadata schema with 15 new properties
- Automated metadata extraction from Markdown, HTML, and text
- Comprehensive CLI tools for document management
- Import/Export capabilities (CSV format)
- Cleanup and validation operations
- AI integration ready

**Business Value:**
- 50%+ reduction in reference management time
- Automated metadata extraction vs. manual entry
- Better organization through rich categorization
- Offline capability for AI workflows
- Data portability for collaboration

**Reference:** See `openspec/changes/update-url-reference/` for complete specification

---

## Phase 1: Schema & Core Infrastructure (hel.1.x.y)

### Task: Design and implement enhanced schema

**ID:** hel.1.1  
**Type:** task  
**Priority:** P1  
**Estimate:** 240 minutes (4 hours)  
**Labels:** phase-1, schema, core  
**Description:**

Design and implement the enhanced UrlMapping schema with 15 new metadata properties.

**Deliverables:**
- Updated `src/types.ts` with enhanced UrlMapping interface
- Schema validation rules in `src/schema.ts`
- Backward compatibility with v1.0 schema
- Migration utilities for v1.0 to v2.0

**New Properties:**
- Content metadata: tags, summary, tldr, wordCount, readingTime, categories
- Author info: author, authorImage, authorUrl
- Media: featuredImage
- Relationships: quotes, internalLinks, externalLinks, relatedPosts
- Required: lastUpdated (now required, was optional)

**Acceptance Criteria:**
- All 15 new properties defined with correct types
- Validation constraints implemented (tldr: 200-900 chars, max 10 quotes, etc.)
- v1.0 configs load without errors
- TypeScript types compile without errors
- Schema validation tests pass

**Blocking:** None  
**Blocked By:** None

---

### Task: Implement schema migration utilities

**ID:** hel.1.2  
**Type:** task  
**Priority:** P1  
**Estimate:** 180 minutes (3 hours)  
**Labels:** phase-1, migration, utilities  
**Dependencies:** hel.1.1  
**Description:**

Create utilities to migrate v1.0 configurations to v2.0 format automatically.

**Deliverables:**
- `src/utils/migration.ts` with migration functions
- Auto-migration on config load
- CLI command: `url-ref migrate <input> <output>`
- Backup creation before migration
- Migration validation

**Acceptance Criteria:**
- v1.0 configs auto-migrate on load
- lastUpdated auto-populated with current timestamp
- metadata object properties extracted to specific fields
- Backup created before migration
- Migration CLI command works
- All migrated configs validate successfully

**Blocking:** hel.2.x (Extractor implementation)  
**Blocked By:** hel.1.1

---

### Task: Implement backup and restore system

**ID:** hel.1.3  
**Type:** task  
**Priority:** P2  
**Estimate:** 120 minutes (2 hours)  
**Labels:** phase-1, backup, utilities  
**Dependencies:** hel.1.1  
**Description:**

Create backup and restore functionality for configuration files.

**Deliverables:**
- `src/utils/backup.ts` with backup/restore functions
- Auto-backup before destructive operations
- CLI command: `url-ref restore <backup>`
- Configurable backup retention (default: 5 backups)
- Backup directory: `./.backups/`

**Acceptance Criteria:**
- Backups created with timestamp in filename
- Max backups enforced (old backups deleted)
- Restore command works correctly
- Backup creation can be disabled with --no-backup
- Tests for backup/restore functionality

**Blocking:** None
**Blocked By:** hel.1.1

---

## Phase 2: Metadata Extraction Engine (hel.2.x.y)

### Task: Implement base extractor architecture

**ID:** hel.2.1
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-2, extraction, architecture
**Dependencies:** hel.1.1
**Description:**

Create base extractor class and factory pattern for metadata extraction.

**Deliverables:**
- `src/extractors/BaseExtractor.ts` - Abstract base class
- `src/extractors/ExtractorFactory.ts` - Factory for selecting extractors
- Common extraction methods (word count, reading time, links, quotes)
- Format detection logic

**Acceptance Criteria:**
- BaseExtractor abstract class with common methods
- ExtractorFactory selects correct extractor based on file extension
- Word count calculation accurate
- Reading time calculation (default: 225 WPM)
- Link extraction works for internal/external links
- Quote extraction identifies blockquotes

**Blocking:** hel.2.2, hel.2.3, hel.2.4
**Blocked By:** hel.1.1

---

### Task: Implement Markdown extractor

**ID:** hel.2.2
**Type:** task
**Priority:** P1
**Estimate:** 360 minutes (6 hours)
**Labels:** phase-2, extraction, markdown
**Dependencies:** hel.2.1
**Description:**

Implement metadata extraction from Markdown documents using unified/remark.

**Deliverables:**
- `src/extractors/MarkdownExtractor.ts`
- Parse Markdown to AST using unified/remark
- Extract frontmatter (title, author, tags, categories)
- Extract headings for summary generation
- Extract blockquotes
- Extract links (internal/external)
- Extract images (featured image)

**Acceptance Criteria:**
- Parses valid Markdown without errors
- Extracts all metadata properties
- Handles frontmatter (YAML, TOML)
- Distinguishes internal vs external links
- Generates summary from first paragraph or heading
- Tests with real Markdown documents
- Handles edge cases (empty files, malformed Markdown)

**Blocking:** None
**Blocked By:** hel.2.1

---

### Task: Implement HTML extractor

**ID:** hel.2.3
**Type:** task
**Priority:** P1
**Estimate:** 360 minutes (6 hours)
**Labels:** phase-2, extraction, html
**Dependencies:** hel.2.1
**Description:**

Implement metadata extraction from HTML documents using cheerio.

**Deliverables:**
- `src/extractors/HtmlExtractor.ts`
- Parse HTML using cheerio
- Extract meta tags (title, description, keywords, author)
- Extract Open Graph tags
- Extract Twitter Card tags
- Extract structured data (JSON-LD)
- Extract content from article/main tags

**Acceptance Criteria:**
- Parses valid HTML without errors
- Extracts SEO meta tags
- Extracts Open Graph metadata
- Extracts Twitter Card metadata
- Handles missing meta tags gracefully
- Generates summary from meta description or first paragraph
- Tests with real HTML documents
- Handles malformed HTML

**Blocking:** None
**Blocked By:** hel.2.1

---

### Task: Implement plain text extractor

**ID:** hel.2.4
**Type:** task
**Priority:** P2
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-2, extraction, text
**Dependencies:** hel.2.1
**Description:**

Implement basic metadata extraction from plain text files.

**Deliverables:**
- `src/extractors/TextExtractor.ts`
- Extract word count and reading time
- Extract URLs using regex
- Generate summary from first N characters
- Basic quote detection (lines starting with >)

**Acceptance Criteria:**
- Calculates word count accurately
- Extracts URLs from text
- Generates basic summary
- Handles different line endings (CRLF, LF)
- Tests with plain text files

**Blocking:** None
**Blocked By:** hel.2.1

---

### Task: Implement extraction configuration

**ID:** hel.2.5
**Type:** task
**Priority:** P2
**Estimate:** 120 minutes (2 hours)
**Labels:** phase-2, extraction, config
**Dependencies:** hel.2.2, hel.2.3, hel.2.4
**Description:**

Create configuration system for extraction behavior.

**Deliverables:**
- ExtractionConfig interface in `src/types.ts`
- Default extraction settings
- Configurable reading speed (WPM)
- Configurable max tags, quotes, links
- Enable/disable extraction features

**Configuration Options:**
```typescript
interface ExtractionConfig {
  enabled: boolean;              // default: true
  readingSpeed: number;          // default: 225 WPM
  maxTags: number;               // default: 35
  maxQuotes: number;             // default: 10
  maxLinks: number;              // default: 10
  generateSummary: boolean;      // default: true
  aiProvider?: string;           // optional AI for summaries
}
```

**Acceptance Criteria:**
- Configuration interface defined
- Default values set
- Configuration validated on load
- Extraction respects configuration limits
- Tests for configuration validation

**Blocking:** None
**Blocked By:** hel.2.2, hel.2.3, hel.2.4

---

### Task: Write extraction system tests

**ID:** hel.2.6
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-2, testing, extraction
**Dependencies:** hel.2.2, hel.2.3, hel.2.4, hel.2.5
**Description:**

Comprehensive tests for all extractors and extraction system.

**Deliverables:**
- `src/__tests__/extractors/` directory
- Unit tests for BaseExtractor
- Unit tests for MarkdownExtractor
- Unit tests for HtmlExtractor
- Unit tests for TextExtractor
- Integration tests for ExtractorFactory
- Test fixtures (sample documents)

**Test Coverage:**
- All extraction methods
- Edge cases (empty files, malformed content)
- Configuration options
- Error handling
- Performance benchmarks

**Acceptance Criteria:**
- 100% code coverage for extractors
- All tests pass
- Performance benchmarks documented
- Test fixtures committed

**Blocking:** None
**Blocked By:** hel.2.2, hel.2.3, hel.2.4, hel.2.5

---

## Phase 3: Enhanced CLI Commands (hel.3.x.y)

### Task: Enhance add command with extraction

**ID:** hel.3.1
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-3, cli, commands
**Dependencies:** hel.2.6
**Description:**

Enhance the `add` command to support metadata extraction.

**Deliverables:**
- Updated `src/cli.ts` add command
- `--extract` flag for automatic metadata extraction
- Manual metadata options (--title, --author, --categories, --tags)
- `--no-validate` flag to skip validation
- Enhanced error messages

**Command Signature:**
```bash
url-ref add <url> <localPath> [options]
  --extract, -e          Extract metadata from document
  --title <title>        Document title (required if not extracting)
  --author <author>      Author name
  --categories <cats>    Comma-separated categories
  --tags <tags>          Comma-separated tags
  --no-validate          Skip validation
```

**Acceptance Criteria:**
- Add command works with --extract flag
- Metadata extracted and saved
- Manual metadata options work
- Validation runs by default
- Error messages are clear and actionable
- Tests for all options

**Blocking:** None
**Blocked By:** hel.2.6

---

### Task: Implement update command

**ID:** hel.3.2
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-3, cli, commands
**Dependencies:** hel.3.1
**Description:**

Implement new `update` command for updating existing mappings.

**Deliverables:**
- New `update` command in `src/cli.ts`
- `--extract` flag for re-extraction
- Update specific fields (--title, --author, --local-path, etc.)
- Validation of updates

**Command Signature:**
```bash
url-ref update <url> [options]
  --extract, -e          Re-extract metadata from document
  --title <title>        Update title
  --author <author>      Update author
  --categories <cats>    Update categories
  --local-path <path>    Update local path
```

**Acceptance Criteria:**
- Update command finds existing mapping by URL
- Re-extraction works with --extract
- Individual fields can be updated
- lastUpdated timestamp updated automatically
- Error if mapping not found
- Tests for all update scenarios

**Blocking:** None
**Blocked By:** hel.3.1

---

### Task: Enhance list command with formatting

**ID:** hel.3.3
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-3, cli, commands, formatting
**Dependencies:** hel.3.1
**Description:**

Enhance `list` command with multiple output formats and filtering.

**Deliverables:**
- Multiple output formats (table, json, csv, compact)
- Filtering by property value
- Sorting by field (title, url, lastUpdated, wordCount)
- Sort order (asc, desc)
- Colored output with --no-color option

**Command Signature:**
```bash
url-ref list [options]
  --format <format>      Output format: table, json, csv, compact
  --filter <filter>      Filter by property (e.g., "author=John")
  --sort <field>         Sort by field
  --order <order>        Sort order: asc, desc
  --no-color             Disable colored output
```

**Acceptance Criteria:**
- All output formats work correctly
- Filtering works for all properties
- Sorting works for all specified fields
- Colored output in TTY, plain in pipes
- --no-color disables colors
- Tests for all formats and options

**Blocking:** None
**Blocked By:** hel.3.1

---

### Task: Implement removal commands

**ID:** hel.3.4
**Type:** task
**Priority:** P1
**Estimate:** 300 minutes (5 hours)
**Labels:** phase-3, cli, commands, cleanup
**Dependencies:** hel.3.1
**Description:**

Implement comprehensive removal commands for cleanup operations.

**Deliverables:**
- Enhanced `remove` command with confirmation
- `remove-by-date` command (--before, --after, --between)
- `remove-by-property` command
- `remove-invalid` command (--urls, --paths, --both)
- `clean` command (interactive cleanup wizard)
- Confirmation prompts with --force to skip

**Command Signatures:**
```bash
url-ref remove <url> [--force]
url-ref remove-by-date [--before <date>] [--after <date>] [--between <d1,d2>]
url-ref remove-by-property <property> <value> [--case-sensitive]
url-ref remove-invalid [--urls] [--paths] [--both]
url-ref clean [--interactive] [--auto]
```

**Acceptance Criteria:**
- All removal commands work correctly
- Confirmation prompts shown (unless --force)
- Backup created before removal
- Date parsing works (ISO 8601)
- Property filtering works
- Invalid entry detection works
- Interactive cleanup wizard functional
- Tests for all removal scenarios

**Blocking:** None
**Blocked By:** hel.3.1

---

### Task: Write CLI command tests

**ID:** hel.3.5
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-3, testing, cli
**Dependencies:** hel.3.2, hel.3.3, hel.3.4
**Description:**

Comprehensive tests for all CLI commands.

**Deliverables:**
- `src/__tests__/cli/` directory
- Integration tests for all commands
- Tests for all command options
- Tests for error conditions
- Tests for confirmation prompts

**Test Coverage:**
- add command with all options
- update command with all options
- list command with all formats
- All removal commands
- Error handling
- User input (confirmations)

**Acceptance Criteria:**
- 100% code coverage for CLI commands
- All tests pass
- Edge cases covered
- Error messages tested

**Blocking:** None
**Blocked By:** hel.3.2, hel.3.3, hel.3.4

---

## Phase 4: Import/Export System (hel.4.x.y)

### Task: Implement CSV export

**ID:** hel.4.1
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-4, import-export, csv
**Dependencies:** hel.3.5
**Description:**

Implement CSV export functionality for bulk data operations.

**Deliverables:**
- `src/utils/csv.ts` with export functions
- `export` command in CLI
- Field selection (--fields option)
- Filtering support
- Proper CSV escaping and quoting

**Command Signature:**
```bash
url-ref export <output.csv> [options]
  --fields <fields>      Comma-separated list of fields (default: all)
  --filter <filter>      Filter by property value
```

**Acceptance Criteria:**
- Exports all mappings to CSV
- Field selection works
- Filtering works
- CSV properly formatted (RFC 4180)
- Handles special characters (quotes, commas, newlines)
- Tests for export functionality

**Blocking:** hel.4.2
**Blocked By:** hel.3.5

---

### Task: Implement CSV import

**ID:** hel.4.2
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-4, import-export, csv
**Dependencies:** hel.4.1
**Description:**

Implement CSV import functionality with validation and merge support.

**Deliverables:**
- Import functions in `src/utils/csv.ts`
- `import` command in CLI
- Merge mode (--merge flag)
- Validation of imported data
- Error handling for invalid rows
- Skip errors option (--skip-errors)

**Command Signature:**
```bash
url-ref import <input.csv> [options]
  --merge, -m            Merge with existing (default: replace)
  --validate             Validate imported data (default: true)
  --skip-errors          Skip invalid rows and continue
```

**Acceptance Criteria:**
- Imports CSV files correctly
- Merge mode preserves existing entries
- Replace mode clears existing entries
- Validation runs on imported data
- Invalid rows reported with line numbers
- --skip-errors continues on errors
- Tests for import functionality

**Blocking:** None
**Blocked By:** hel.4.1

---

### Task: Write import/export tests

**ID:** hel.4.3
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-4, testing, import-export
**Dependencies:** hel.4.2
**Description:**

Comprehensive tests for import/export functionality.

**Deliverables:**
- Unit tests for CSV utilities
- Integration tests for export command
- Integration tests for import command
- Test fixtures (sample CSV files)

**Test Coverage:**
- Export all fields
- Export selected fields
- Export with filtering
- Import replace mode
- Import merge mode
- Import validation
- Import error handling
- CSV edge cases (special characters, empty fields)

**Acceptance Criteria:**
- 100% code coverage for CSV utilities
- All tests pass
- Test fixtures committed
- Edge cases covered

**Blocking:** None
**Blocked By:** hel.4.2

---

## Phase 5: Validation System (hel.5.x.y)

### Task: Implement URL validator

**ID:** hel.5.1
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-5, validation, urls
**Dependencies:** hel.1.1
**Description:**

Implement comprehensive URL validation.

**Deliverables:**
- `src/validators/UrlValidator.ts`
- Format validation (HTTP/HTTPS only)
- Optional accessibility check (HTTP HEAD request)
- Detailed validation results

**Validation Checks:**
- Valid URL format
- HTTP or HTTPS protocol
- Reachable (optional, with timeout)
- Returns 200 OK (optional)

**Acceptance Criteria:**
- Validates URL format correctly
- Rejects non-HTTP(S) URLs
- Accessibility check works (when enabled)
- Timeout handling for slow URLs
- Detailed error messages
- Tests for all validation scenarios

**Blocking:** hel.5.4
**Blocked By:** hel.1.1

---

### Task: Implement path validator

**ID:** hel.5.2
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-5, validation, paths
**Dependencies:** hel.1.1
**Description:**

Implement comprehensive file path validation.

**Deliverables:**
- `src/validators/PathValidator.ts`
- File existence check
- File permissions check
- File type validation
- Path traversal prevention

**Validation Checks:**
- File exists
- File is readable
- File type is supported (md, html, txt)
- Path is within allowed directories
- No path traversal attempts

**Acceptance Criteria:**
- Validates file existence
- Checks file permissions
- Validates file types
- Prevents path traversal
- Cross-platform path handling
- Tests for all validation scenarios

**Blocking:** hel.5.4
**Blocked By:** hel.1.1

---

### Task: Implement metadata validator

**ID:** hel.5.3
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-5, validation, metadata
**Dependencies:** hel.1.1
**Description:**

Implement comprehensive metadata validation.

**Deliverables:**
- `src/validators/MetadataValidator.ts`
- Validate all UrlMapping properties
- Check constraints (string lengths, array sizes)
- Validate URLs in metadata (authorUrl, featuredImage, etc.)
- Aggregate validation results

**Validation Checks:**
- Required fields present (title, url, localPath, lastUpdated)
- tldr length (200-900 characters)
- Array sizes (max 10 for quotes, links, etc.)
- URL format for image/author URLs
- Date format for lastUpdated
- String constraints

**Acceptance Criteria:**
- Validates all properties
- Enforces all constraints
- Detailed error messages with field names
- Warning vs error distinction
- Tests for all validation rules

**Blocking:** hel.5.4
**Blocked By:** hel.1.1

---

### Task: Enhance validate command

**ID:** hel.5.4
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-5, cli, validation
**Dependencies:** hel.5.1, hel.5.2, hel.5.3
**Description:**

Enhance the `validate` command with comprehensive validation options.

**Deliverables:**
- Enhanced `validate` command in `src/cli.ts`
- Targeted validation (--urls, --paths, --metadata)
- Auto-fix option (--fix)
- Validation report export (--report)
- Detailed output with error/warning counts

**Command Signature:**
```bash
url-ref validate [options]
  --urls                 Validate URLs only
  --paths                Validate file paths only
  --metadata             Validate metadata only
  --fix                  Attempt to auto-fix issues
  --report <file>        Save validation report to file
```

**Acceptance Criteria:**
- Validates all mappings by default
- Targeted validation works
- Auto-fix corrects common issues
- Report export works (JSON format)
- Clear summary of errors/warnings
- Exit code indicates validation status
- Tests for all validation options

**Blocking:** None
**Blocked By:** hel.5.1, hel.5.2, hel.5.3

---

### Task: Write validation system tests

**ID:** hel.5.5
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-5, testing, validation
**Dependencies:** hel.5.4
**Description:**

Comprehensive tests for validation system.

**Deliverables:**
- `src/__tests__/validators/` directory
- Unit tests for UrlValidator
- Unit tests for PathValidator
- Unit tests for MetadataValidator
- Integration tests for validate command

**Test Coverage:**
- All validation rules
- Edge cases (empty strings, null values)
- Auto-fix functionality
- Report generation
- Error message quality

**Acceptance Criteria:**
- 100% code coverage for validators
- All tests pass
- Edge cases covered
- Performance benchmarks

**Blocking:** None
**Blocked By:** hel.5.4

---

## Phase 6: Configuration & Options (hel.6.x.y)

### Task: Implement extraction configuration

**ID:** hel.6.1
**Type:** task
**Priority:** P2
**Estimate:** 120 minutes (2 hours)
**Labels:** phase-6, config, extraction
**Dependencies:** hel.2.5
**Description:**

Implement configuration system for extraction behavior (already partially done in hel.2.5, this completes it).

**Deliverables:**
- Configuration file support (.url-ref-config.json)
- Environment variable support
- CLI option overrides
- Configuration validation

**Configuration Structure:**
```json
{
  "extraction": {
    "enabled": true,
    "readingSpeed": 225,
    "maxTags": 35,
    "maxQuotes": 10,
    "generateSummary": true
  },
  "validation": {
    "checkUrls": false,
    "checkPaths": true,
    "strictMode": false
  },
  "backup": {
    "enabled": true,
    "maxBackups": 5,
    "backupPath": "./.backups"
  }
}
```

**Acceptance Criteria:**
- Configuration file loaded automatically
- Environment variables override config file
- CLI options override environment variables
- Configuration validated on load
- Default values used when not specified
- Tests for configuration loading

**Blocking:** None
**Blocked By:** hel.2.5

---

### Task: Implement validation configuration

**ID:** hel.6.2
**Type:** task
**Priority:** P2
**Estimate:** 120 minutes (2 hours)
**Labels:** phase-6, config, validation
**Dependencies:** hel.5.5
**Description:**

Implement configuration for validation behavior.

**Deliverables:**
- ValidationConfig interface
- Configuration options for URL checking
- Configuration options for path checking
- Strict mode option

**Acceptance Criteria:**
- URL accessibility check configurable
- Path existence check configurable
- Strict mode enforces all constraints
- Configuration respected by validators
- Tests for configuration options

**Blocking:** None
**Blocked By:** hel.5.5

---

### Task: Write configuration tests

**ID:** hel.6.3
**Type:** task
**Priority:** P2
**Estimate:** 120 minutes (2 hours)
**Labels:** phase-6, testing, config
**Dependencies:** hel.6.1, hel.6.2
**Description:**

Comprehensive tests for configuration system.

**Deliverables:**
- Tests for configuration loading
- Tests for configuration validation
- Tests for configuration precedence
- Tests for default values

**Acceptance Criteria:**
- All configuration scenarios tested
- Precedence order verified
- Invalid configurations rejected
- Tests pass

**Blocking:** None
**Blocked By:** hel.6.1, hel.6.2

---

## Phase 7: Integration & Testing (hel.7.x.y)

### Task: Write integration tests

**ID:** hel.7.1
**Type:** task
**Priority:** P1
**Estimate:** 360 minutes (6 hours)
**Labels:** phase-7, testing, integration
**Dependencies:** hel.3.5, hel.4.3, hel.5.5, hel.6.3
**Description:**

Comprehensive integration tests for complete workflows.

**Deliverables:**
- `src/__tests__/integration/` directory
- End-to-end workflow tests
- Multi-command scenarios
- Real document processing tests

**Test Scenarios:**
- Add with extraction → validate → export
- Import → validate → fix → export
- Bulk operations (add multiple, remove multiple)
- Migration workflow (v1.0 → v2.0)
- Backup and restore workflow

**Acceptance Criteria:**
- All workflows tested end-to-end
- Real documents used in tests
- Error scenarios covered
- Performance acceptable
- Tests pass consistently

**Blocking:** hel.7.2
**Blocked By:** hel.3.5, hel.4.3, hel.5.5, hel.6.3

---

### Task: Cross-platform testing

**ID:** hel.7.2
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-7, testing, cross-platform
**Dependencies:** hel.7.1
**Description:**

Test on Windows, macOS, and Linux platforms.

**Deliverables:**
- CI/CD pipeline for all platforms
- Platform-specific test cases
- Path handling tests for each OS
- Documentation of platform differences

**Test Coverage:**
- Windows (PowerShell, CMD)
- macOS (Bash, Zsh)
- Linux (Bash)
- Path separators (\ vs /)
- Line endings (CRLF vs LF)
- File permissions

**Acceptance Criteria:**
- All tests pass on all platforms
- CI/CD runs on all platforms
- Platform-specific issues documented
- Path handling works correctly

**Blocking:** hel.7.3
**Blocked By:** hel.7.1

---

### Task: Performance testing and optimization

**ID:** hel.7.3
**Type:** task
**Priority:** P2
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-7, testing, performance
**Dependencies:** hel.7.2
**Description:**

Performance testing and optimization.

**Deliverables:**
- Performance benchmarks
- Load testing (1000+ mappings)
- Extraction speed benchmarks
- Memory usage profiling
- Optimization recommendations

**Performance Targets:**
- Load 1000 mappings in <100ms
- Extract metadata from 5KB document in <200ms
- Validate 1000 mappings in <500ms
- Export 1000 mappings to CSV in <200ms

**Acceptance Criteria:**
- All performance targets met
- Benchmarks documented
- Memory leaks identified and fixed
- Optimization opportunities documented

**Blocking:** hel.7.4
**Blocked By:** hel.7.2

---

### Task: Achieve 100% code coverage

**ID:** hel.7.4
**Type:** task
**Priority:** P1
**Estimate:** 300 minutes (5 hours)
**Labels:** phase-7, testing, coverage
**Dependencies:** hel.7.3
**Description:**

Achieve 100% code coverage for all critical paths.

**Deliverables:**
- Coverage reports
- Tests for uncovered code
- Coverage badges
- Coverage enforcement in CI/CD

**Coverage Targets:**
- Overall: 90%+
- Critical paths: 100%
- Extractors: 100%
- Validators: 100%
- CLI commands: 95%+

**Acceptance Criteria:**
- Coverage targets met
- Coverage reports generated
- CI/CD fails on coverage regression
- All critical paths covered

**Blocking:** None
**Blocked By:** hel.7.3

---

## Phase 8: Documentation (hel.8.x.y)

### Task: Write migration guide

**ID:** hel.8.1
**Type:** task
**Priority:** P1
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-8, documentation, migration
**Dependencies:** hel.7.4
**Description:**

Create comprehensive migration guide from v1.0 to v2.0.

**Deliverables:**
- `docs/migration-guide.md`
- Step-by-step migration instructions
- Breaking changes documentation
- Migration examples
- Rollback instructions

**Content:**
- Overview of changes
- Breaking changes (lastUpdated now required)
- Deprecated features (metadata object)
- Migration steps
- CLI migration command usage
- Rollback procedure
- FAQ

**Acceptance Criteria:**
- Guide covers all breaking changes
- Step-by-step instructions clear
- Examples provided
- Rollback procedure documented
- Reviewed by stakeholders

**Blocking:** None
**Blocked By:** hel.7.4

---

### Task: Write CLI usage documentation

**ID:** hel.8.2
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-8, documentation, cli
**Dependencies:** hel.7.4
**Description:**

Create comprehensive CLI usage documentation.

**Deliverables:**
- `docs/cli-usage.md`
- Documentation for all commands
- Examples for each command
- Common workflows
- Troubleshooting guide

**Content:**
- Command reference (all commands)
- Options reference (all options)
- Output formats
- Examples for common tasks
- Advanced usage (batch, interactive)
- Troubleshooting common issues

**Acceptance Criteria:**
- All commands documented
- Examples for each command
- Common workflows covered
- Troubleshooting section complete
- Reviewed by stakeholders

**Blocking:** None
**Blocked By:** hel.7.4

---

### Task: Write API reference documentation

**ID:** hel.8.3
**Type:** task
**Priority:** P1
**Estimate:** 240 minutes (4 hours)
**Labels:** phase-8, documentation, api
**Dependencies:** hel.7.4
**Description:**

Create comprehensive API reference documentation.

**Deliverables:**
- `docs/api-reference.md`
- Documentation for all classes
- Documentation for all methods
- TypeScript type definitions
- Usage examples

**Content:**
- UrlReferenceMapper class
- Extractor classes
- Validator classes
- Utility functions
- Type definitions
- Configuration interfaces
- Examples for each API

**Acceptance Criteria:**
- All public APIs documented
- Type signatures included
- Examples for each method
- Return types documented
- Error conditions documented

**Blocking:** None
**Blocked By:** hel.7.4

---

### Task: Create example projects

**ID:** hel.8.4
**Type:** task
**Priority:** P2
**Estimate:** 180 minutes (3 hours)
**Labels:** phase-8, documentation, examples
**Dependencies:** hel.8.1, hel.8.2, hel.8.3
**Description:**

Create example projects demonstrating usage.

**Deliverables:**
- `docs/examples/basic/` - Basic usage example
- `docs/examples/advanced/` - Advanced features example
- `docs/examples/ai-integration/` - AI workflow example
- README for each example

**Examples:**
- Basic: Simple add/list/validate workflow
- Advanced: Extraction, import/export, cleanup
- AI Integration: Batch operations, JSON output

**Acceptance Criteria:**
- All examples work correctly
- Each example has README
- Examples demonstrate key features
- Code is well-commented

**Blocking:** None
**Blocked By:** hel.8.1, hel.8.2, hel.8.3

---

### Task: Update main README

**ID:** hel.8.5
**Type:** task
**Priority:** P1
**Estimate:** 120 minutes (2 hours)
**Labels:** phase-8, documentation, readme
**Dependencies:** hel.8.1, hel.8.2, hel.8.3
**Description:**

Update main README.md with v2.0 features.

**Deliverables:**
- Updated `README.md`
- New features section
- Updated quick start
- Updated API documentation
- Updated CLI documentation

**Content:**
- What's new in v2.0
- Updated installation instructions
- Updated quick start
- Updated API examples
- Updated CLI examples
- Links to detailed documentation

**Acceptance Criteria:**
- README reflects v2.0 features
- All examples work
- Links to docs correct
- Reviewed by stakeholders

**Blocking:** None
**Blocked By:** hel.8.1, hel.8.2, hel.8.3

---

### Task: Update CHANGELOG

**ID:** hel.8.6
**Type:** task
**Priority:** P1
**Estimate:** 60 minutes (1 hour)
**Labels:** phase-8, documentation, changelog
**Dependencies:** hel.8.5
**Description:**

Update CHANGELOG.md with v2.0 changes.

**Deliverables:**
- Updated `CHANGELOG.md`
- All changes documented
- Breaking changes highlighted
- Migration notes included

**Content:**
- Version 2.0.0 section
- Added features
- Changed features
- Deprecated features
- Breaking changes
- Migration notes

**Acceptance Criteria:**
- All changes documented
- Breaking changes highlighted
- Follows Keep a Changelog format
- Reviewed by stakeholders

**Blocking:** None
**Blocked By:** hel.8.5

---

## Phase 9: Release Preparation (hel.9.x.y)

### Task: Create release notes

**ID:** hel.9.1
**Type:** task
**Priority:** P1
**Estimate:** 120 minutes (2 hours)
**Labels:** phase-9, release, documentation
**Dependencies:** hel.8.6
**Description:**

Create release notes for v2.0.0.

**Deliverables:**
- Release notes document
- Highlights of new features
- Breaking changes summary
- Upgrade instructions
- Known issues

**Content:**
- Executive summary
- New features highlights
- Breaking changes
- Upgrade guide
- Known issues and workarounds
- Contributors acknowledgment

**Acceptance Criteria:**
- Release notes complete
- All major features highlighted
- Breaking changes clear
- Upgrade path documented
- Reviewed by stakeholders

**Blocking:** hel.9.2
**Blocked By:** hel.8.6

---

### Task: Final testing and bug fixes

**ID:** hel.9.2
**Type:** task
**Priority:** P1
**Estimate:** 360 minutes (6 hours)
**Labels:** phase-9, testing, bugfix
**Dependencies:** hel.9.1
**Description:**

Final round of testing and bug fixes before release.

**Deliverables:**
- All tests passing
- All known bugs fixed
- Regression testing complete
- Performance validation

**Testing:**
- Full regression test suite
- Manual testing of all features
- Cross-platform testing
- Performance benchmarks
- Security audit

**Acceptance Criteria:**
- All tests pass on all platforms
- No critical bugs
- Performance targets met
- Security issues resolved
- Ready for release

**Blocking:** hel.9.3
**Blocked By:** hel.9.1

---

### Task: Update package version and dependencies

**ID:** hel.9.3
**Type:** task
**Priority:** P1
**Estimate:** 60 minutes (1 hour)
**Labels:** phase-9, release, packaging
**Dependencies:** hel.9.2
**Description:**

Update package.json and prepare for npm publish.

**Deliverables:**
- Updated `package.json` (version 2.0.0)
- Updated dependencies to latest stable
- Updated `package-lock.json`
- Build verification

**Tasks:**
- Bump version to 2.0.0
- Update dependencies
- Run `npm audit fix`
- Verify build
- Test installation

**Acceptance Criteria:**
- Version updated to 2.0.0
- Dependencies up to date
- No security vulnerabilities
- Build succeeds
- Package installs correctly

**Blocking:** hel.9.4
**Blocked By:** hel.9.2

---

### Task: Publish to npm

**ID:** hel.9.4
**Type:** task
**Priority:** P1
**Estimate:** 60 minutes (1 hour)
**Labels:** phase-9, release, publishing
**Dependencies:** hel.9.3
**Description:**

Publish v2.0.0 to npm registry.

**Deliverables:**
- Package published to npm
- Git tag created (v2.0.0)
- GitHub release created
- Announcement prepared

**Tasks:**
- Run final build
- Run final tests
- Publish to npm
- Create git tag
- Create GitHub release
- Announce release

**Acceptance Criteria:**
- Package available on npm
- Git tag created
- GitHub release published
- Release notes attached
- Announcement sent

**Blocking:** None
**Blocked By:** hel.9.3

---

## Summary

### Task Count by Phase

| Phase | Tasks | Estimate (hours) |
|-------|-------|------------------|
| Phase 1: Schema & Core Infrastructure | 3 | 10 |
| Phase 2: Metadata Extraction Engine | 6 | 25 |
| Phase 3: Enhanced CLI Commands | 5 | 19 |
| Phase 4: Import/Export System | 3 | 10 |
| Phase 5: Validation System | 5 | 19 |
| Phase 6: Configuration & Options | 3 | 6 |
| Phase 7: Integration & Testing | 4 | 23 |
| Phase 8: Documentation | 6 | 16 |
| Phase 9: Release Preparation | 4 | 10 |
| **Total** | **39** | **138** |

### Dependencies Overview

```
hel.1.1 (Schema)
    ├─> hel.1.2 (Migration)
    ├─> hel.1.3 (Backup)
    ├─> hel.2.1 (Base Extractor)
    │       ├─> hel.2.2 (Markdown)
    │       ├─> hel.2.3 (HTML)
    │       ├─> hel.2.4 (Text)
    │       └─> hel.2.5 (Config)
    │               └─> hel.2.6 (Tests)
    │                       └─> hel.3.1 (Add Command)
    │                               ├─> hel.3.2 (Update)
    │                               ├─> hel.3.3 (List)
    │                               ├─> hel.3.4 (Remove)
    │                               └─> hel.3.5 (Tests)
    │                                       └─> hel.4.1 (Export)
    │                                               └─> hel.4.2 (Import)
    │                                                       └─> hel.4.3 (Tests)
    ├─> hel.5.1 (URL Validator)
    ├─> hel.5.2 (Path Validator)
    └─> hel.5.3 (Metadata Validator)
            └─> hel.5.4 (Validate Command)
                    └─> hel.5.5 (Tests)
                            └─> hel.6.2 (Validation Config)

hel.2.5 (Extraction Config)
    └─> hel.6.1 (Config System)

hel.6.1 + hel.6.2
    └─> hel.6.3 (Config Tests)

hel.3.5 + hel.4.3 + hel.5.5 + hel.6.3
    └─> hel.7.1 (Integration Tests)
            └─> hel.7.2 (Cross-platform)
                    └─> hel.7.3 (Performance)
                            └─> hel.7.4 (Coverage)
                                    └─> hel.8.1 (Migration Guide)
                                    └─> hel.8.2 (CLI Docs)
                                    └─> hel.8.3 (API Docs)
                                            └─> hel.8.4 (Examples)
                                            └─> hel.8.5 (README)
                                                    └─> hel.8.6 (CHANGELOG)
                                                            └─> hel.9.1 (Release Notes)
                                                                    └─> hel.9.2 (Final Testing)
                                                                            └─> hel.9.3 (Package)
                                                                                    └─> hel.9.4 (Publish)
```

### Critical Path

The critical path for this project is:
1. hel.1.1 → hel.2.1 → hel.2.2 → hel.2.6 → hel.3.1 → hel.3.5 → hel.7.1 → hel.7.2 → hel.7.3 → hel.7.4 → hel.8.1 → hel.8.6 → hel.9.1 → hel.9.2 → hel.9.3 → hel.9.4

**Estimated Duration:** 138 hours (17.25 days @ 8 hours/day)

### Next Steps

1. Review and approve this task breakdown
2. Create bead tasks using: `bd create --file bead-tasks-hel.md`
3. Begin implementation with hel.1.1 (Schema design)
4. Follow dependency chain for optimal workflow

---

**Generated:** 2026-02-21
**Based on:** `openspec/changes/update-url-reference/` specification
**Format:** Bead task definitions with hel.x.y.z ID structure

