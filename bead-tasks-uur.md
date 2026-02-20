# URL Reference Mapper v2.0 - Bead Tasks

**Project:** URL Reference Mapper Enhancement  
**Version:** 2.0.0  
**JIRA Ticket:** AUG-500  
**Date:** 2026-02-20  
**Total Tasks:** 71  
**Total Hours:** 280 hours

---

## Task ID Format

**Format:** `uur.x.y.z`
- **uur** = URL Reference (project prefix)
- **x** = Phase number (1-5)
- **y** = Task number within phase
- **z** = Sub-task number (0 if no sub-tasks)

---

## Phase 1: Schema & Core Extraction (80 hours)

### 1.1 Schema Updates (9 hours)

#### uur.1.1.0 - Update TypeScript types for enhanced schema
**Estimate:** 2h  
**Status:** Not Started  
**Dependencies:** None  
**Description:**
Add 15 new optional properties to `UrlMapping` interface including tags, summary, tldr, wordCount, readingTime, categories, author info, featuredImages, quotes, links, and lastUpdated. Update validation types to support new schema structure.

**Details:**
- Extend UrlMapping interface with new properties
- Ensure backward compatibility with v1.0
- Add TypeScript type definitions for all new fields
- Update type exports

**Acceptance Criteria:**
- [ ] All 15 new properties added to interface
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing types
- [ ] Type definitions exported correctly

---

#### uur.1.2.0 - Update JSON schema validation
**Estimate:** 2h  
**Status:** Not Started  
**Dependencies:** uur.1.1.0  
**Description:**
Add validators for new properties including ISO 8601 date validation, array length constraints (max 10 items for quotes/links), and type validation for all new fields.

**Details:**
- Implement ISO 8601 date format validation
- Add array length constraints (max 10 for quotes, links)
- Add string length constraints (summary, tldr)
- Validate nested object structures (author info)

**Acceptance Criteria:**
- [ ] ISO 8601 date validation works
- [ ] Array constraints enforced
- [ ] Invalid data rejected with clear errors
- [ ] Validation performance acceptable

---

#### uur.1.3.0 - Implement schema migration utility
**Estimate:** 3h  
**Status:** Not Started  
**Dependencies:** uur.1.2.0  
**Description:**
Create utility to convert v1.0 configs to v2.0 format, preserving existing data while adding new optional fields. Include rollback capability.

**Details:**
- Auto-detect v1.0 vs v2.0 format
- Migrate existing fields without data loss
- Add default values for new optional fields
- Create backup before migration
- Support rollback to v1.0

**Acceptance Criteria:**
- [ ] v1.0 configs migrate successfully
- [ ] No data loss during migration
- [ ] Backup created automatically
- [ ] Rollback functionality works
- [ ] Migration is idempotent

---

#### uur.1.4.0 - Write schema unit tests
**Estimate:** 2h  
**Status:** Not Started  
**Dependencies:** uur.1.3.0  
**Description:**
Comprehensive unit tests for all new property validations, backward compatibility, and migration scenarios.

**Details:**
- Test each new property validation
- Test backward compatibility with v1.0
- Test migration from v1.0 to v2.0
- Test edge cases (empty, null, invalid)
- Test rollback scenarios

**Acceptance Criteria:**
- [ ] 100% coverage of validation logic
- [ ] All edge cases tested
- [ ] Migration tests pass
- [ ] Backward compatibility verified

---

### 1.2 Document Parsing (13 hours)

#### uur.1.5.0 - Research and select parsing libraries
**Estimate:** 2h  
**Status:** Not Started  
**Dependencies:** None  
**Description:**
Evaluate parsing libraries (unified for Markdown, cheerio for HTML, regex for plain text). Perform benchmarks and license compatibility checks.

**Details:**
- Evaluate unified (remark/rehype ecosystem)
- Evaluate cheerio for HTML parsing
- Benchmark parsing performance
- Check license compatibility (MIT preferred)
- Document selection rationale

**Acceptance Criteria:**
- [ ] Libraries evaluated and documented
- [ ] Performance benchmarks completed
- [ ] License compatibility verified
- [ ] Selection rationale documented

---

#### uur.1.6.0 - Implement Markdown parser
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.5.0
**Description:**
Implement Markdown parser using unified/remark to extract text content, parse frontmatter (YAML/TOML), and extract links.

**Details:**
- Use unified/remark for parsing
- Extract plain text content
- Parse frontmatter (YAML, TOML, JSON)
- Extract all links (internal and external)
- Handle malformed Markdown gracefully

**Acceptance Criteria:**
- [ ] Parses valid Markdown correctly
- [ ] Extracts frontmatter
- [ ] Extracts all links
- [ ] Handles malformed input gracefully

---

#### uur.1.7.0 - Implement HTML parser
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.5.0
**Description:**
Implement HTML parser using cheerio to extract text content, parse meta tags, and extract links and images.

**Details:**
- Use cheerio for HTML parsing
- Extract text content (strip tags)
- Parse meta tags (og:, twitter:, etc.)
- Extract links (a href)
- Extract images (img src, og:image)

**Acceptance Criteria:**
- [ ] Parses valid HTML correctly
- [ ] Extracts meta tags
- [ ] Extracts links and images
- [ ] Handles malformed HTML gracefully

---

#### uur.1.8.0 - Implement plain text parser
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.5.0
**Description:**
Implement plain text parser with basic link detection using regex patterns.

**Details:**
- Extract text content as-is
- Detect URLs using regex
- Handle different line endings
- Support UTF-8 encoding

**Acceptance Criteria:**
- [ ] Extracts text correctly
- [ ] Detects URLs in text
- [ ] Handles different encodings
- [ ] Handles different line endings

---

#### uur.1.9.0 - Write parser unit tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.6.0, uur.1.7.0, uur.1.8.0
**Description:**
Comprehensive unit tests for each parser with sample documents and edge cases.

**Details:**
- Test Markdown parser with various formats
- Test HTML parser with various structures
- Test plain text parser
- Test edge cases (empty, malformed, large files)
- Test encoding issues

**Acceptance Criteria:**
- [ ] All parsers tested
- [ ] Edge cases covered
- [ ] Performance acceptable
- [ ] Error handling verified

---

### 1.3 Metadata Extraction (14 hours)

#### uur.1.10.0 - Implement word count calculator
**Estimate:** 1h
**Status:** Not Started
**Dependencies:** uur.1.6.0, uur.1.7.0, uur.1.8.0
**Description:**
Implement accurate word counting that handles different languages and special characters.

**Details:**
- Count words accurately (whitespace-separated)
- Handle CJK characters (count as words)
- Exclude code blocks from count
- Handle hyphenated words correctly

**Acceptance Criteria:**
- [ ] Accurate word count for English
- [ ] Handles CJK characters
- [ ] Excludes code blocks
- [ ] Performance acceptable

---

#### uur.1.11.0 - Implement reading time calculator
**Estimate:** 1h
**Status:** Not Started
**Dependencies:** uur.1.10.0
**Description:**
Calculate reading time based on word count with configurable reading speed (default 200 wpm).

**Details:**
- Calculate based on word count
- Configurable reading speed (default 200 wpm)
- Round to nearest minute
- Return in minutes

**Acceptance Criteria:**
- [ ] Accurate reading time calculation
- [ ] Configurable reading speed
- [ ] Reasonable output format

---

#### uur.1.12.0 - Implement tag extraction
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.6.0, uur.1.7.0, uur.1.8.0
**Description:**
Extract keywords from content for SEO tags, limiting to ~35 tags maximum.

**Details:**
- Extract keywords from content
- Use TF-IDF or similar algorithm
- Extract from frontmatter/meta tags
- Limit to ~35 tags
- Remove common stop words

**Acceptance Criteria:**
- [ ] Extracts relevant keywords
- [ ] Respects tag limit
- [ ] Removes stop words
- [ ] Handles multiple sources

---

#### uur.1.13.0 - Implement quote extraction
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.6.0, uur.1.7.0, uur.1.8.0
**Description:**
Identify and extract notable quotes from content, up to 10 quotes maximum.

**Details:**
- Detect blockquotes in Markdown
- Detect <blockquote> in HTML
- Detect quoted text in plain text
- Extract up to 10 quotes
- Preserve quote formatting

**Acceptance Criteria:**
- [ ] Extracts blockquotes correctly
- [ ] Respects quote limit
- [ ] Preserves formatting
- [ ] Handles nested quotes

---

#### uur.1.14.0 - Implement link extraction
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.6.0, uur.1.7.0, uur.1.8.0
**Description:**
Extract and differentiate internal vs external links, up to 10 of each type.

**Details:**
- Extract all links from content
- Differentiate internal vs external
- Limit to 10 internal, 10 external
- Validate link format
- Remove duplicates

**Acceptance Criteria:**
- [ ] Extracts all links
- [ ] Differentiates internal/external
- [ ] Respects limits
- [ ] Removes duplicates

---

#### uur.1.15.0 - Implement summary generation
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.6.0, uur.1.7.0, uur.1.8.0
**Description:**
Generate one-sentence summary and TLDR (200-900 chars) with optional AI integration hook.

**Details:**
- Extract first paragraph as summary
- Generate TLDR from content
- Optional AI integration for better summaries
- Respect character limits
- Fallback to manual extraction

**Acceptance Criteria:**
- [ ] Generates summary
- [ ] Generates TLDR (200-900 chars)
- [ ] AI hook available
- [ ] Fallback works

---

#### uur.1.16.0 - Write extraction unit tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.10.0, uur.1.11.0, uur.1.12.0, uur.1.13.0, uur.1.14.0, uur.1.15.0
**Description:**
Comprehensive unit tests for each extraction function with various document types and edge cases.

**Details:**
- Test word count with various content
- Test reading time calculation
- Test tag extraction
- Test quote extraction
- Test link extraction
- Test summary generation
- Test edge cases

**Acceptance Criteria:**
- [ ] All extractors tested
- [ ] Edge cases covered
- [ ] Performance acceptable
- [ ] Error handling verified

---

### 1.4 Core Integration (5 hours)

#### uur.1.17.0 - Integrate extraction into UrlReferenceMapper
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.16.0
**Description:**
Add extraction methods to main UrlReferenceMapper class and update constructor options.

**Details:**
- Add extractMetadata() method
- Update constructor to accept extraction options
- Integrate all extractors
- Add configuration options
- Maintain backward compatibility

**Acceptance Criteria:**
- [ ] Extraction methods added
- [ ] Constructor updated
- [ ] All extractors integrated
- [ ] Backward compatible

---

#### uur.1.18.0 - Write integration tests
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.17.0
**Description:**
End-to-end integration tests with real documents to verify complete extraction workflow.

**Details:**
- Test with real Markdown documents
- Test with real HTML documents
- Test with real plain text documents
- Test complete extraction workflow
- Test error handling

**Acceptance Criteria:**
- [ ] E2E tests pass
- [ ] Real documents tested
- [ ] Complete workflow verified
- [ ] Error handling works

---

## Phase 2: CLI Framework (64 hours)

### 2.1 CLI Architecture (4 hours)

#### uur.2.1.0 - Design CLI command structure
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** None
**Description:**
Define command hierarchy, argument/option patterns, and CLI architecture using Commander.js.

**Details:**
- Define command hierarchy
- Plan argument/option patterns
- Design help system
- Plan error handling
- Document CLI architecture

**Acceptance Criteria:**
- [ ] Command structure documented
- [ ] Argument patterns defined
- [ ] Help system designed
- [ ] Error handling planned

---

#### uur.2.2.0 - Set up CLI testing framework
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** None
**Description:**
Configure Jest for CLI testing and create test helpers for command execution.

**Details:**
- Configure Jest for CLI tests
- Create test helpers
- Set up fixtures
- Configure coverage
- Document testing approach

**Acceptance Criteria:**
- [ ] Jest configured
- [ ] Test helpers created
- [ ] Fixtures available
- [ ] Coverage configured

---

### 2.2 Document Management Commands (13 hours)

#### uur.2.3.0 - Implement `add` command
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.1.17.0
**Description:**
Implement CLI command to add document with automatic metadata extraction.

**Details:**
- Parse command arguments
- Validate URL and path
- Extract metadata automatically
- Update JSON file
- Provide user feedback

**Acceptance Criteria:**
- [ ] Command works correctly
- [ ] Metadata extracted
- [ ] JSON file updated
- [ ] User feedback clear

---

#### uur.2.4.0 - Write tests for `add` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.2.3.0
**Description:**
Comprehensive tests for add command including valid inputs and error cases.

**Details:**
- Test valid inputs
- Test invalid URL
- Test invalid path
- Test duplicate entries
- Test error messages

**Acceptance Criteria:**
- [ ] Valid inputs tested
- [ ] Error cases tested
- [ ] Edge cases covered
- [ ] Error messages verified

---

#### uur.2.5.0 - Implement `update` command
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.2.3.0
**Description:**
Implement CLI command to update existing document and re-extract metadata.

**Details:**
- Find existing document
- Re-extract metadata
- Update JSON file
- Preserve manual edits (optional)
- Provide user feedback

**Acceptance Criteria:**
- [ ] Updates existing documents
- [ ] Re-extracts metadata
- [ ] Preserves manual edits
- [ ] User feedback clear

---

#### uur.2.6.0 - Write tests for `update` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.2.5.0
**Description:**
Tests for update command including update scenarios and non-existent documents.

**Details:**
- Test update scenarios
- Test non-existent documents
- Test partial updates
- Test error handling

**Acceptance Criteria:**
- [ ] Update scenarios tested
- [ ] Error cases tested
- [ ] Partial updates work
- [ ] Error messages verified

---

#### uur.2.7.0 - Implement `list` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.17.0
**Description:**
Display all documents with formatted output showing lastUpdated dates.

**Details:**
- List all documents
- Format output (table, JSON, etc.)
- Show lastUpdated dates
- Support filtering options
- Support sorting

**Acceptance Criteria:**
- [ ] Lists all documents
- [ ] Output formatted nicely
- [ ] Shows lastUpdated
- [ ] Filtering works

---

#### uur.2.8.0 - Write tests for `list` command
**Estimate:** 1h
**Status:** Not Started
**Dependencies:** uur.2.7.0
**Description:**
Tests for list command including output formatting and empty list scenarios.

**Details:**
- Test output formatting
- Test empty list
- Test filtering
- Test sorting

**Acceptance Criteria:**
- [ ] Output format tested
- [ ] Empty list handled
- [ ] Filtering tested
- [ ] Sorting tested

---

### 2.3 Removal Commands (13 hours)

#### uur.2.9.0 - Implement `remove` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.17.0
**Description:**
Remove document by URL with confirmation prompt.

**Details:**
- Remove by URL
- Confirmation prompt
- Update JSON file
- Provide user feedback
- Support --yes flag

**Acceptance Criteria:**
- [ ] Removes by URL
- [ ] Confirmation works
- [ ] JSON updated
- [ ] --yes flag works

---

#### uur.2.10.0 - Implement `remove-by-date` command
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.2.9.0
**Description:**
Filter and remove documents by date range (before/after/between).

**Details:**
- Filter by date range
- Support before/after/between
- Confirmation prompt
- Dry-run mode
- Batch removal

**Acceptance Criteria:**
- [ ] Date filtering works
- [ ] All date modes work
- [ ] Dry-run available
- [ ] Batch removal works

---

#### uur.2.11.0 - Implement `remove-by-property` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.2.9.0
**Description:**
Filter and remove documents by property value with support for multiple strings.

**Details:**
- Filter by property value
- Support multiple values
- Confirmation prompt
- Dry-run mode
- Batch removal

**Acceptance Criteria:**
- [ ] Property filtering works
- [ ] Multiple values supported
- [ ] Dry-run available
- [ ] Batch removal works

---

#### uur.2.12.0 - Implement `remove-invalid` command
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.2.9.0
**Description:**
Validate URLs and paths, remove invalid entries with multiple validation modes.

**Details:**
- Validate URLs
- Validate file paths
- Multiple validation modes
- Confirmation prompt
- Dry-run mode

**Acceptance Criteria:**
- [ ] URL validation works
- [ ] Path validation works
- [ ] Validation modes work
- [ ] Dry-run available

---

#### uur.2.13.0 - Write tests for removal commands
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.2.9.0, uur.2.10.0, uur.2.11.0, uur.2.12.0
**Description:**
Comprehensive tests for all removal scenarios and dry-run mode.

**Details:**
- Test all removal commands
- Test dry-run mode
- Test confirmation prompts
- Test error cases
- Test batch operations

**Acceptance Criteria:**
- [ ] All commands tested
- [ ] Dry-run tested
- [ ] Confirmations tested
- [ ] Error cases covered

---

### 2.4 Help & Documentation (7 hours)

#### uur.2.14.0 - Implement help system
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.2.3.0, uur.2.5.0, uur.2.7.0, uur.2.9.0, uur.2.10.0, uur.2.11.0, uur.2.12.0
**Description:**
Add comprehensive help text for all commands with usage examples.

**Details:**
- Add help text for all commands
- Include usage examples
- Document all options
- Add global help
- Format help nicely

**Acceptance Criteria:**
- [ ] All commands have help
- [ ] Examples included
- [ ] Options documented
- [ ] Help formatted well

---

#### uur.2.15.0 - Add verbose/debug modes
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.2.14.0
**Description:**
Implement logging levels and debug output for troubleshooting.

**Details:**
- Implement logging levels
- Add verbose mode
- Add debug mode
- Add quiet mode
- Configure log output

**Acceptance Criteria:**
- [ ] Logging levels work
- [ ] Verbose mode works
- [ ] Debug mode works
- [ ] Quiet mode works

---

#### uur.2.16.0 - Write CLI integration tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.2.14.0, uur.2.15.0
**Description:**
Test complete CLI workflows and error handling.

**Details:**
- Test complete workflows
- Test error handling
- Test help system
- Test logging modes
- Test edge cases

**Acceptance Criteria:**
- [ ] Workflows tested
- [ ] Error handling tested
- [ ] Help system tested
- [ ] Logging tested

---

## Phase 3: Import/Export (32 hours)

### 3.1 CSV Export (6 hours)

#### uur.3.1.0 - Research CSV libraries
**Estimate:** 1h
**Status:** Not Started
**Dependencies:** None
**Description:**
Evaluate CSV libraries (csv-parse, papaparse) for performance and compatibility.

**Details:**
- Evaluate csv-parse
- Evaluate papaparse
- Benchmark performance
- Check compatibility
- Document selection

**Acceptance Criteria:**
- [ ] Libraries evaluated
- [ ] Benchmarks completed
- [ ] Selection documented

---

#### uur.3.2.0 - Implement CSV export
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.3.1.0
**Description:**
Convert JSON to CSV including all metadata fields and handling nested arrays.

**Details:**
- Convert JSON to CSV
- Include all fields
- Handle nested arrays
- Handle special characters
- Format dates properly

**Acceptance Criteria:**
- [ ] JSON converts to CSV
- [ ] All fields included
- [ ] Arrays handled
- [ ] Special chars escaped

---

#### uur.3.3.0 - Write CSV export tests
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.3.2.0
**Description:**
Test CSV export with various data and field escaping.

**Details:**
- Test with various data
- Test field escaping
- Test nested arrays
- Test special characters
- Test large datasets

**Acceptance Criteria:**
- [ ] Various data tested
- [ ] Escaping works
- [ ] Arrays exported correctly
- [ ] Performance acceptable

---

### 3.2 CSV Import (7 hours)

#### uur.3.4.0 - Implement CSV import
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.3.1.0
**Description:**
Parse CSV to JSON, validate imported data, and merge with existing data.

**Details:**
- Parse CSV to JSON
- Validate imported data
- Merge with existing data
- Handle duplicates
- Error reporting

**Acceptance Criteria:**
- [ ] CSV parses to JSON
- [ ] Data validated
- [ ] Merging works
- [ ] Duplicates handled

---

#### uur.3.5.0 - Write CSV import tests
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.3.4.0
**Description:**
Test CSV import with valid CSV, malformed CSV, and missing fields.

**Details:**
- Test valid CSV
- Test malformed CSV
- Test missing fields
- Test duplicate entries
- Test error messages

**Acceptance Criteria:**
- [ ] Valid CSV imported
- [ ] Malformed CSV rejected
- [ ] Missing fields handled
- [ ] Errors clear

---

### 3.3 CLI Commands (6 hours)

#### uur.3.6.0 - Implement `export` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.3.2.0
**Description:**
Export to CSV with support for output path option.

**Details:**
- Export to CSV
- Support output path
- Support stdout
- Format output
- Error handling

**Acceptance Criteria:**
- [ ] Exports to CSV
- [ ] Output path works
- [ ] Stdout works
- [ ] Errors handled

---

#### uur.3.7.0 - Implement `import` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.3.4.0
**Description:**
Import from CSV with validation and error reporting.

**Details:**
- Import from CSV
- Validate data
- Error reporting
- Merge options
- Confirmation prompt

**Acceptance Criteria:**
- [ ] Imports from CSV
- [ ] Validation works
- [ ] Errors reported
- [ ] Merging works

---

#### uur.3.8.0 - Write import/export CLI tests
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.3.6.0, uur.3.7.0
**Description:**
Test round-trip (export → import) and error cases.

**Details:**
- Test round-trip
- Test error cases
- Test file paths
- Test stdout/stdin
- Test data integrity

**Acceptance Criteria:**
- [ ] Round-trip works
- [ ] Error cases tested
- [ ] Data integrity verified
- [ ] Paths tested

---

### 3.4 Integration Tests (5 hours)

#### uur.3.9.0 - Write round-trip integration tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.3.8.0
**Description:**
Test data integrity and large datasets in round-trip scenarios.

**Details:**
- Test data integrity
- Test with large datasets
- Test all field types
- Test edge cases
- Verify no data loss

**Acceptance Criteria:**
- [ ] Data integrity verified
- [ ] Large datasets work
- [ ] All fields preserved
- [ ] No data loss

---

#### uur.3.10.0 - Performance testing
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.3.9.0
**Description:**
Benchmark export/import speed with 1000+ items.

**Details:**
- Benchmark export speed
- Benchmark import speed
- Test with 1000+ items
- Identify bottlenecks
- Document performance

**Acceptance Criteria:**
- [ ] Benchmarks completed
- [ ] 1000+ items tested
- [ ] Performance acceptable
- [ ] Bottlenecks identified

---

## Phase 4: Cleanup & Validation (40 hours)

### 4.1 Validation Logic (9 hours)

#### uur.4.1.0 - Implement URL validator
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** None
**Description:**
Validate URL format and optionally check URL accessibility.

**Details:**
- Validate URL format
- Check URL accessibility (optional)
- Support HTTP/HTTPS
- Handle redirects
- Timeout handling

**Acceptance Criteria:**
- [ ] URL format validated
- [ ] Accessibility check works
- [ ] Redirects handled
- [ ] Timeouts handled

---

#### uur.4.2.0 - Implement path validator
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** None
**Description:**
Check file existence and file permissions.

**Details:**
- Check file existence
- Check file permissions
- Handle relative paths
- Handle absolute paths
- Cross-platform support

**Acceptance Criteria:**
- [ ] File existence checked
- [ ] Permissions checked
- [ ] Paths handled correctly
- [ ] Cross-platform works

---

#### uur.4.3.0 - Implement property validators
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** None
**Description:**
Null/empty checks and type validation for all properties.

**Details:**
- Null/empty checks
- Type validation
- Range validation
- Format validation
- Custom validators

**Acceptance Criteria:**
- [ ] Null checks work
- [ ] Type validation works
- [ ] Range validation works
- [ ] Custom validators work

---

#### uur.4.4.0 - Write validation unit tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.4.1.0, uur.4.2.0, uur.4.3.0
**Description:**
Test all validators and edge cases.

**Details:**
- Test all validators
- Test edge cases
- Test error messages
- Test performance
- Test cross-platform

**Acceptance Criteria:**
- [ ] All validators tested
- [ ] Edge cases covered
- [ ] Errors clear
- [ ] Performance good

---

### 4.2 Cleanup Operations (8 hours)

#### uur.4.5.0 - Implement cleanup engine
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.4.4.0
**Description:**
Filter by validation status, property values, and date ranges.

**Details:**
- Filter by validation status
- Filter by property values
- Filter by date ranges
- Combine filters
- Batch operations

**Acceptance Criteria:**
- [ ] Validation filter works
- [ ] Property filter works
- [ ] Date filter works
- [ ] Filters combine

---

#### uur.4.6.0 - Add dry-run mode
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.4.5.0
**Description:**
Preview changes without applying with detailed reporting.

**Details:**
- Preview changes
- Detailed reporting
- Show what would be removed
- No actual changes
- Clear output

**Acceptance Criteria:**
- [ ] Dry-run works
- [ ] No changes made
- [ ] Report detailed
- [ ] Output clear

---

#### uur.4.7.0 - Write cleanup tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.4.6.0
**Description:**
Test all filter combinations and dry-run mode.

**Details:**
- Test all filters
- Test filter combinations
- Test dry-run mode
- Test batch operations
- Test error cases

**Acceptance Criteria:**
- [ ] All filters tested
- [ ] Combinations tested
- [ ] Dry-run tested
- [ ] Errors handled

---

### 4.3 CLI Integration (7 hours)

#### uur.4.8.0 - Implement `validate` command
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.4.4.0
**Description:**
Run all validators and generate validation report.

**Details:**
- Run all validators
- Generate report
- Show validation status
- List invalid entries
- Summary statistics

**Acceptance Criteria:**
- [ ] All validators run
- [ ] Report generated
- [ ] Status shown
- [ ] Summary clear

---

#### uur.4.9.0 - Implement `clean` command
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.4.6.0
**Description:**
Interactive cleanup wizard and batch cleanup options.

**Details:**
- Interactive wizard
- Batch cleanup
- Confirmation prompts
- Dry-run option
- Progress reporting

**Acceptance Criteria:**
- [ ] Wizard works
- [ ] Batch mode works
- [ ] Confirmations work
- [ ] Progress shown

---

#### uur.4.10.0 - Write validation CLI tests
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.4.8.0, uur.4.9.0
**Description:**
Test validate and clean commands.

**Details:**
- Test validate command
- Test clean command
- Test interactive mode
- Test batch mode
- Test error cases

**Acceptance Criteria:**
- [ ] Validate tested
- [ ] Clean tested
- [ ] Interactive tested
- [ ] Batch tested

---

### 4.4 Error Handling (8 hours)

#### uur.4.11.0 - Implement error recovery
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.4.9.0
**Description:**
Graceful error handling and rollback on failure.

**Details:**
- Graceful error handling
- Rollback on failure
- Transaction support
- Error logging
- User feedback

**Acceptance Criteria:**
- [ ] Errors handled gracefully
- [ ] Rollback works
- [ ] Transactions work
- [ ] Errors logged

---

#### uur.4.12.0 - Add backup/restore
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.4.11.0
**Description:**
Auto-backup before destructive operations and restore command.

**Details:**
- Auto-backup before changes
- Restore command
- Backup management
- Cleanup old backups
- Verify backups

**Acceptance Criteria:**
- [ ] Auto-backup works
- [ ] Restore works
- [ ] Backups managed
- [ ] Verification works

---

#### uur.4.13.0 - Write error handling tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.4.12.0
**Description:**
Test error scenarios and backup/restore functionality.

**Details:**
- Test error scenarios
- Test backup/restore
- Test rollback
- Test transactions
- Test edge cases

**Acceptance Criteria:**
- [ ] Errors tested
- [ ] Backup/restore tested
- [ ] Rollback tested
- [ ] Edge cases covered

---

## Phase 5: Testing & Documentation (64 hours)

### 5.1 Comprehensive Testing (20 hours)

#### uur.5.1.0 - Write performance tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** All previous phases
**Description:**
Test large document extraction and large dataset operations.

**Details:**
- Test large document extraction
- Test large dataset operations
- Benchmark performance
- Identify bottlenecks
- Document results

**Acceptance Criteria:**
- [ ] Large docs tested
- [ ] Large datasets tested
- [ ] Benchmarks done
- [ ] Results documented

---

#### uur.5.2.0 - Write compatibility tests
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** All previous phases
**Description:**
Test on Windows, macOS, Linux and different Node versions.

**Details:**
- Test on Windows
- Test on macOS
- Test on Linux
- Test Node 20+
- Test Node 21+

**Acceptance Criteria:**
- [ ] Windows tested
- [ ] macOS tested
- [ ] Linux tested
- [ ] Node versions tested

---

#### uur.5.3.0 - Write regression tests
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.1.3.0
**Description:**
Ensure v1.0 compatibility and test migration scenarios.

**Details:**
- Test v1.0 compatibility
- Test migration scenarios
- Test backward compatibility
- Test no breaking changes
- Document compatibility

**Acceptance Criteria:**
- [ ] v1.0 compatible
- [ ] Migration tested
- [ ] No breaking changes
- [ ] Documented

---

#### uur.5.4.0 - Achieve 80% code coverage
**Estimate:** 8h
**Status:** Not Started
**Dependencies:** uur.5.1.0, uur.5.2.0, uur.5.3.0
**Description:**
Write additional unit tests and cover edge cases to reach 80% coverage.

**Details:**
- Write additional tests
- Cover edge cases
- Cover error paths
- Cover all branches
- Generate coverage report

**Acceptance Criteria:**
- [ ] 80% coverage achieved
- [ ] Edge cases covered
- [ ] Error paths covered
- [ ] Report generated

---

#### uur.5.5.0 - User acceptance testing
**Estimate:** 4h
**Status:** Not Started
**Dependencies:** uur.5.4.0
**Description:**
Manual testing of CLI and usability feedback.

**Details:**
- Manual CLI testing
- Usability feedback
- Real-world scenarios
- User documentation review
- Collect feedback

**Acceptance Criteria:**
- [ ] Manual testing done
- [ ] Feedback collected
- [ ] Scenarios tested
- [ ] Docs reviewed

---

### 5.2 Documentation (23 hours)

#### uur.5.6.0 - Update README.md
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** All previous phases
**Description:**
New features overview and quick start guide.

**Details:**
- Overview of new features
- Quick start guide
- Installation instructions
- Basic usage examples
- Links to detailed docs

**Acceptance Criteria:**
- [ ] Features documented
- [ ] Quick start clear
- [ ] Examples included
- [ ] Links work

---

#### uur.5.7.0 - Write API documentation
**Estimate:** 4h
**Status:** Not Started
**Dependencies:** uur.5.6.0
**Description:**
Document all new methods with TypeScript examples.

**Details:**
- Document all methods
- TypeScript examples
- Parameter descriptions
- Return type descriptions
- Error descriptions

**Acceptance Criteria:**
- [ ] All methods documented
- [ ] Examples included
- [ ] Types documented
- [ ] Errors documented

---

#### uur.5.8.0 - Write CLI usage guide
**Estimate:** 4h
**Status:** Not Started
**Dependencies:** uur.5.7.0
**Description:**
Document all commands, usage examples, and common workflows.

**Details:**
- Document all commands
- Usage examples
- Common workflows
- Best practices
- Troubleshooting

**Acceptance Criteria:**
- [ ] Commands documented
- [ ] Examples clear
- [ ] Workflows documented
- [ ] Troubleshooting included

---

#### uur.5.9.0 - Write migration guide
**Estimate:** 3h
**Status:** Not Started
**Dependencies:** uur.5.8.0
**Description:**
v1.0 to v2.0 migration and breaking changes documentation.

**Details:**
- Migration steps
- Breaking changes
- Upgrade checklist
- Rollback procedure
- FAQ

**Acceptance Criteria:**
- [ ] Migration clear
- [ ] Breaking changes listed
- [ ] Checklist complete
- [ ] FAQ helpful

---

#### uur.5.10.0 - Create example projects
**Estimate:** 4h
**Status:** Not Started
**Dependencies:** uur.5.9.0
**Description:**
Basic usage, advanced usage, and AI integration examples.

**Details:**
- Basic usage example
- Advanced usage example
- AI integration example
- Real-world scenarios
- Commented code

**Acceptance Criteria:**
- [ ] Basic example works
- [ ] Advanced example works
- [ ] AI example works
- [ ] Code commented

---

#### uur.5.11.0 - Write CHANGELOG.md
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.5.10.0
**Description:**
Document all changes and breaking changes section.

**Details:**
- Document all changes
- Breaking changes section
- New features section
- Bug fixes section
- Follow Keep a Changelog format

**Acceptance Criteria:**
- [ ] All changes listed
- [ ] Breaking changes clear
- [ ] Format correct
- [ ] Complete

---

### 5.3 Release Preparation (13 hours)

#### uur.5.12.0 - Update package.json
**Estimate:** 1h
**Status:** Not Started
**Dependencies:** uur.5.11.0
**Description:**
Version bump to 2.0.0 and update dependencies.

**Details:**
- Bump version to 2.0.0
- Update dependencies
- Update scripts
- Update metadata
- Verify package.json

**Acceptance Criteria:**
- [ ] Version bumped
- [ ] Dependencies updated
- [ ] Scripts updated
- [ ] Metadata correct

---

#### uur.5.13.0 - Build and test distribution
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.5.12.0
**Description:**
Test npm package build and installation.

**Details:**
- Build package
- Test installation
- Test in clean environment
- Verify files included
- Test CLI globally

**Acceptance Criteria:**
- [ ] Package builds
- [ ] Installation works
- [ ] Clean env tested
- [ ] CLI works globally

---

#### uur.5.14.0 - Security audit
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.5.13.0
**Description:**
Run npm audit and review dependencies.

**Details:**
- Run npm audit
- Review dependencies
- Fix vulnerabilities
- Update insecure deps
- Document security

**Acceptance Criteria:**
- [ ] Audit run
- [ ] Vulnerabilities fixed
- [ ] Dependencies secure
- [ ] Documented

---

#### uur.5.15.0 - Create release notes
**Estimate:** 2h
**Status:** Not Started
**Dependencies:** uur.5.14.0
**Description:**
Highlight new features and migration instructions.

**Details:**
- Highlight new features
- Migration instructions
- Breaking changes
- Known issues
- Acknowledgments

**Acceptance Criteria:**
- [ ] Features highlighted
- [ ] Migration clear
- [ ] Breaking changes listed
- [ ] Complete

---

#### uur.5.16.0 - Final QA review
**Estimate:** 4h
**Status:** Not Started
**Dependencies:** uur.5.15.0
**Description:**
Complete feature checklist and test all acceptance criteria.

**Details:**
- Complete feature checklist
- Test all acceptance criteria
- Final manual testing
- Review all documentation
- Sign-off

**Acceptance Criteria:**
- [ ] All features work
- [ ] All criteria met
- [ ] Manual testing done
- [ ] Docs reviewed
- [ ] Ready for release

---

## Summary

**Total Tasks:** 71
**Total Estimated Hours:** 280 hours
**Recommended Team Size:** 2-3 developers
**Estimated Calendar Time:** 8-10 weeks

### Phase Summary

| Phase | Tasks | Hours | Description |
|-------|-------|-------|-------------|
| Phase 1 | 18 | 80 | Schema & Core Extraction |
| Phase 2 | 16 | 64 | CLI Framework |
| Phase 3 | 10 | 32 | Import/Export |
| Phase 4 | 13 | 40 | Cleanup & Validation |
| Phase 5 | 16 | 64 | Testing & Documentation |

### Critical Path

1. **Phase 1** (Schema & Extraction) → **Phase 2** (CLI Framework)
2. **Phase 2** → **Phase 3** (Import/Export) & **Phase 4** (Cleanup)
3. **Phases 3 & 4** → **Phase 5** (Testing & Documentation)

### Milestones

- **M1**: Schema complete (Week 2) - uur.1.18.0
- **M2**: CLI framework complete (Week 4) - uur.2.16.0
- **M3**: Import/Export complete (Week 5) - uur.3.10.0
- **M4**: Cleanup & Validation complete (Week 6) - uur.4.13.0
- **M5**: Testing & Documentation complete (Week 8) - uur.5.16.0
- **M6**: Release v2.0.0 (Week 10)

---

## Task Dependencies Map

### Phase 1 Dependencies
- uur.1.1.0 → uur.1.2.0 → uur.1.3.0 → uur.1.4.0
- uur.1.5.0 → uur.1.6.0, uur.1.7.0, uur.1.8.0 → uur.1.9.0
- uur.1.6.0, uur.1.7.0, uur.1.8.0 → uur.1.10.0 → uur.1.11.0
- uur.1.6.0, uur.1.7.0, uur.1.8.0 → uur.1.12.0, uur.1.13.0, uur.1.14.0, uur.1.15.0
- uur.1.10.0 through uur.1.15.0 → uur.1.16.0 → uur.1.17.0 → uur.1.18.0

### Phase 2 Dependencies
- uur.1.17.0 → uur.2.3.0 → uur.2.4.0
- uur.2.3.0 → uur.2.5.0 → uur.2.6.0
- uur.1.17.0 → uur.2.7.0 → uur.2.8.0
- uur.1.17.0 → uur.2.9.0 → uur.2.10.0, uur.2.11.0, uur.2.12.0
- uur.2.9.0 through uur.2.12.0 → uur.2.13.0
- All commands → uur.2.14.0 → uur.2.15.0 → uur.2.16.0

### Phase 3 Dependencies
- uur.3.1.0 → uur.3.2.0 → uur.3.3.0
- uur.3.1.0 → uur.3.4.0 → uur.3.5.0
- uur.3.2.0 → uur.3.6.0
- uur.3.4.0 → uur.3.7.0
- uur.3.6.0, uur.3.7.0 → uur.3.8.0 → uur.3.9.0 → uur.3.10.0

### Phase 4 Dependencies
- uur.4.1.0, uur.4.2.0, uur.4.3.0 → uur.4.4.0 → uur.4.5.0 → uur.4.6.0 → uur.4.7.0
- uur.4.4.0 → uur.4.8.0
- uur.4.6.0 → uur.4.9.0
- uur.4.8.0, uur.4.9.0 → uur.4.10.0
- uur.4.9.0 → uur.4.11.0 → uur.4.12.0 → uur.4.13.0

### Phase 5 Dependencies
- All previous phases → uur.5.1.0, uur.5.2.0
- uur.1.3.0 → uur.5.3.0
- uur.5.1.0, uur.5.2.0, uur.5.3.0 → uur.5.4.0 → uur.5.5.0
- All previous phases → uur.5.6.0 → uur.5.7.0 → uur.5.8.0 → uur.5.9.0 → uur.5.10.0 → uur.5.11.0
- uur.5.11.0 → uur.5.12.0 → uur.5.13.0 → uur.5.14.0 → uur.5.15.0 → uur.5.16.0

---

## Notes

- Task estimates assume experienced TypeScript/Node.js developers
- Adjust timeline for team skill level and availability
- All tasks follow OpenSpec rules (max 2-3 hours per task)
- Testing is integrated throughout all phases
- Documentation is comprehensive and user-focused
- Backward compatibility is maintained with v1.0
- 80%+ code coverage target for all code
- Cross-platform support (Windows, macOS, Linux)
- Node.js 20+ compatibility required

---

**Status:** Ready for implementation ✅
**Last Updated:** 2026-02-20
