# Bead Tasks: URL Reference Mapper v2.0 Enhancement

**Project**: URL Reference Mapper Enhancement  
**Version**: 2.0.0  
**JIRA Ticket**: AUG-500  
**Generated**: 2026-02-21  
**Total Tasks**: 71  
**Total Estimated Hours**: 280 hours (35 working days)

---

## Task ID Format

Tasks use the format `CLI.x.y.z` where:
- **x** = Phase/Feature number (1-5)
- **y** = Task number within phase
- **z** = Subtask number (0 for main tasks)

---

## Phase 1: Schema & Core Extraction (80 hours)

### 1.1 Schema Updates

#### CLI.1.1.0 - Update TypeScript types for enhanced schema
**Estimate**: 2 hours  
**Priority**: P1  
**Type**: Task  
**Dependencies**: None

**Description**:
Add 15 new optional properties to the `UrlMapping` interface to support rich metadata extraction. This includes content analysis fields (tags, summary, tldr, wordCount, readingTime), categorization (categories, author information), media (featuredImage, authorImage), and relationships (quotes, internalLinks, externalLinks, relatedPosts).

**Deliverables**:
- Updated `UrlMapping` interface in `src/types.ts`
- New validation types for metadata fields
- TypeScript compilation with no errors

**Acceptance Criteria**:
- All 15 new properties added as optional fields
- Properties match JSON schema specification
- Type definitions exported correctly
- No breaking changes to existing v1.0 types

**Technical Details**:
```typescript
interface UrlMapping {
  // Required (v1.0 compatible)
  title: string;
  url: string;
  localPath: string;
  lastUpdated: string;
  
  // New optional metadata (v2.0)
  tags?: string;
  summary?: string;
  tldr?: string;
  wordCount?: number;
  readingTime?: number;
  categories?: string;
  author?: string;
  authorImage?: string;
  authorUrl?: string;
  featuredImage?: string;
  quotes?: string[];
  internalLinks?: string[];
  externalLinks?: string[];
  relatedPosts?: string[];
}
```

---

#### CLI.1.2.0 - Update JSON schema validation
**Estimate**: 2 hours  
**Priority**: P1  
**Type**: Task  
**Dependencies**: CLI.1.1.0

**Description**:
Update the JSON schema (`schema.json`) to include validators for all new properties. Add ISO 8601 date validation for `lastUpdated`, array length constraints (max 10 items for quotes, links, relatedPosts), string length limits (tldr: 200-900 chars, tags: ~35 tags), and format validation for URLs.

**Deliverables**:
- Updated `schema.json` with v2.0 schema
- Validation rules for all new properties
- Schema validation tests

**Acceptance Criteria**:
- Schema validates all required fields
- Array length constraints enforced (max 10 items)
- String length constraints enforced
- ISO 8601 date format validated
- URL format validated with regex pattern `^https?://`
- Backward compatible with v1.0 configs

**Technical Details**:
- Use JSON Schema Draft 7 or later
- Add `minLength`, `maxLength` constraints
- Add `maxItems` for arrays
- Add `format: date-time` for timestamps
- Add `pattern` for URL validation

---

#### CLI.1.3.0 - Implement schema migration utility
**Estimate**: 3 hours  
**Priority**: P1  
**Type**: Task  
**Dependencies**: CLI.1.2.0

**Description**:
Create a migration utility to convert v1.0 configuration files to v2.0 format. The utility must preserve all existing data, add default values for new optional fields, update the version number, and provide detailed migration logs.

**Deliverables**:
- Migration utility function `migrateV1ToV2()`
- CLI command `url-ref migrate <input> <output>`
- Migration tests with sample v1.0 configs
- Migration documentation

**Acceptance Criteria**:
- Successfully migrates v1.0 to v2.0 format
- Preserves all existing data (title, url, localPath)
- Adds `lastUpdated` timestamp if missing
- Updates version field to "2.0.0"
- Creates backup of original file
- Provides detailed migration report
- Handles edge cases (empty configs, malformed JSON)

**Technical Details**:
```typescript
function migrateV1ToV2(v1Config: any): UrlReferenceConfig {
  return {
    version: "2.0.0",
    mappings: v1Config.mappings.map(m => ({
      ...m,
      lastUpdated: m.lastUpdated || new Date().toISOString()
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}
```

---

#### CLI.1.4.0 - Write schema unit tests
**Estimate**: 2 hours  
**Priority**: P1  
**Type**: Task  
**Dependencies**: CLI.1.3.0

**Description**:
Create comprehensive unit tests for schema validation and migration. Test all new property validations, backward compatibility with v1.0 configs, migration scenarios, and edge cases.

**Deliverables**:
- Unit tests for schema validation
- Unit tests for migration utility
- Edge case tests
- Test coverage report

**Acceptance Criteria**:
- All new properties validated correctly
- Array length constraints tested
- String length constraints tested
- Date format validation tested
- Migration preserves data correctly
- Edge cases handled (empty, null, malformed)
- 100% code coverage for schema module

---

### 1.2 Document Parsing & Metadata Extraction

#### CLI.1.5.0 - Implement Markdown parser
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.4.0

**Description**:
Create a Markdown parser that extracts structured content from .md files. Parse frontmatter (YAML/TOML), extract headings hierarchy, identify code blocks, extract links (internal/external), and calculate word count excluding code blocks.

**Deliverables**:
- Markdown parser module `src/extractors/markdown-parser.ts`
- Support for CommonMark and GitHub Flavored Markdown
- Frontmatter extraction (YAML, TOML, JSON)
- Parser unit tests

**Acceptance Criteria**:
- Parses frontmatter correctly (YAML, TOML, JSON)
- Extracts all headings with hierarchy
- Identifies code blocks and excludes from word count
- Extracts all links (markdown and HTML)
- Handles malformed markdown gracefully
- Performance: <100ms for 10,000 word documents

**Technical Details**:
- Use `marked` or `remark` for parsing
- Use `gray-matter` for frontmatter
- Extract metadata: headings, links, code blocks, word count

---

#### CLI.1.6.0 - Implement HTML parser
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.4.0

**Description**:
Create an HTML parser that extracts metadata from HTML documents. Parse meta tags (title, description, keywords, author, og:*, twitter:*), extract structured data (JSON-LD, microdata), identify main content area, and extract links.

**Deliverables**:
- HTML parser module `src/extractors/html-parser.ts`
- Meta tag extraction
- Structured data extraction (JSON-LD, microdata)
- Parser unit tests

**Acceptance Criteria**:
- Extracts all meta tags (SEO, Open Graph, Twitter Cards)
- Parses JSON-LD structured data
- Identifies main content area (article, main tags)
- Extracts all links with context
- Handles malformed HTML gracefully
- Performance: <200ms for typical web pages

**Technical Details**:
- Use `cheerio` or `jsdom` for parsing
- Extract: title, description, keywords, author, og:*, twitter:*
- Parse JSON-LD for structured data

---

#### CLI.1.7.0 - Implement plain text parser
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.4.0

**Description**:
Create a plain text parser for .txt files. Calculate word count, estimate reading time, extract URLs, identify potential headings (ALL CAPS, underlined), and detect paragraph structure.

**Deliverables**:
- Plain text parser module `src/extractors/text-parser.ts`
- Word count and reading time calculation
- URL extraction
- Parser unit tests

**Acceptance Criteria**:
- Accurate word count calculation
- Reading time estimation (200 words/minute)
- Extracts all URLs (http, https, www)
- Identifies potential headings
- Handles various text encodings (UTF-8, ASCII)
- Performance: <50ms for 10,000 word documents

---

#### CLI.1.8.0 - Implement SEO tag extractor
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.6.0

**Description**:
Create an SEO tag extractor that generates ~35 relevant tags from document content. Use TF-IDF for keyword extraction, extract existing meta keywords, analyze heading text, and filter common stop words.

**Deliverables**:
- SEO tag extractor `src/extractors/seo-extractor.ts`
- TF-IDF keyword extraction
- Tag generation algorithm
- Extractor unit tests

**Acceptance Criteria**:
- Generates 30-40 relevant tags per document
- Uses TF-IDF for keyword importance
- Filters stop words and common terms
- Prioritizes heading text and meta keywords
- Returns comma-separated string
- Performance: <500ms per document

**Technical Details**:
- Use `natural` or `compromise` for NLP
- Implement TF-IDF scoring
- Filter stop words (the, a, an, is, etc.)
- Prioritize: headings > meta keywords > body text

---

#### CLI.1.9.0 - Implement summary generator
**Estimate**: 5 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.5.0, CLI.1.6.0, CLI.1.7.0

**Description**:
Create a summary generator that produces one-sentence summaries and 200-900 character TL;DR summaries. Extract first paragraph, use heading analysis, apply text summarization algorithms, and ensure character limits.

**Deliverables**:
- Summary generator `src/extractors/summary-generator.ts`
- One-sentence summary algorithm
- TL;DR generation (200-900 chars)
- Generator unit tests

**Acceptance Criteria**:
- Generates concise one-sentence summaries
- TL;DR between 200-900 characters
- Uses first paragraph when available
- Falls back to heading analysis
- Handles documents without clear structure
- Performance: <1s per document

**Technical Details**:
- Extract first paragraph as primary source
- Use heading hierarchy for context
- Truncate intelligently at sentence boundaries
- Ensure character limits enforced

---

#### CLI.1.10.0 - Implement reading time calculator
**Estimate**: 2 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.5.0, CLI.1.6.0, CLI.1.7.0

**Description**:
Create a reading time calculator that estimates reading time in minutes. Use 200 words/minute average, exclude code blocks from count, account for images (12 seconds each), and round to nearest minute.

**Deliverables**:
- Reading time calculator `src/extractors/reading-time.ts`
- Word count analysis
- Image count adjustment
- Calculator unit tests

**Acceptance Criteria**:
- Accurate reading time estimation
- Uses 200 words/minute baseline
- Excludes code blocks from word count
- Adds 12 seconds per image
- Rounds to nearest minute
- Minimum 1 minute for any content

---

#### CLI.1.11.0 - Implement quote extractor
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.5.0, CLI.1.6.0

**Description**:
Create a quote extractor that identifies notable quotes from documents. Extract blockquotes from Markdown, extract <blockquote> from HTML, identify quoted text patterns, and limit to 10 most significant quotes.

**Deliverables**:
- Quote extractor `src/extractors/quote-extractor.ts`
- Blockquote extraction
- Quote ranking algorithm
- Extractor unit tests

**Acceptance Criteria**:
- Extracts all blockquotes from Markdown
- Extracts all <blockquote> from HTML
- Identifies quoted text patterns ("...", '...')
- Returns max 10 quotes
- Prioritizes longer, more substantial quotes
- Each quote max 1000 characters

---

#### CLI.1.12.0 - Implement link analyzer
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.5.0, CLI.1.6.0

**Description**:
Create a link analyzer that categorizes links as internal or external. Detect same-domain links as internal, extract all external links, validate link formats, and limit to 10 links per category.

**Deliverables**:
- Link analyzer `src/extractors/link-analyzer.ts`
- Internal/external link classification
- Link validation
- Analyzer unit tests

**Acceptance Criteria**:
- Correctly classifies internal vs external links
- Extracts all valid HTTP/HTTPS links
- Validates link formats
- Returns max 10 internal links
- Returns max 10 external links
- Handles relative URLs correctly

---

#### CLI.1.13.0 - Implement category classifier
**Estimate**: 5 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.8.0

**Description**:
Create a category classifier that suggests 3-5 categories based on content analysis. Use keyword analysis, analyze heading structure, extract existing categories from frontmatter, and provide confidence scores.

**Deliverables**:
- Category classifier `src/extractors/category-classifier.ts`
- Keyword-based classification
- Category suggestion algorithm
- Classifier unit tests

**Acceptance Criteria**:
- Suggests 3-5 relevant categories
- Uses keyword analysis for classification
- Extracts existing categories from metadata
- Provides confidence scores
- Returns comma-separated string
- Performance: <500ms per document

---

#### CLI.1.14.0 - Implement author extractor
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.5.0, CLI.1.6.0

**Description**:
Create an author extractor that identifies author information from documents. Extract from frontmatter (author field), parse meta tags (author, article:author), extract from bylines, and extract author URLs and images.

**Deliverables**:
- Author extractor `src/extractors/author-extractor.ts`
- Frontmatter author extraction
- Meta tag author extraction
- Extractor unit tests

**Acceptance Criteria**:
- Extracts author from frontmatter
- Extracts author from meta tags
- Identifies byline patterns ("By John Doe")
- Extracts author URL (authorUrl)
- Extracts author image (authorImage)
- Handles multiple author formats

---

#### CLI.1.15.0 - Implement image extractor
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.5.0, CLI.1.6.0

**Description**:
Create an image extractor that identifies featured images. Extract from frontmatter (image, featured_image), parse Open Graph images (og:image), extract first image from content, and validate image URLs.

**Deliverables**:
- Image extractor `src/extractors/image-extractor.ts`
- Frontmatter image extraction
- Open Graph image extraction
- Extractor unit tests

**Acceptance Criteria**:
- Extracts featured image from frontmatter
- Extracts og:image from meta tags
- Falls back to first content image
- Validates image URLs
- Handles relative image paths
- Returns absolute URLs only

---

#### CLI.1.16.0 - Implement related posts finder
**Estimate**: 5 hours
**Priority**: P3
**Type**: Task
**Dependencies**: CLI.1.8.0

**Description**:
Create a related posts finder that suggests related documents based on content similarity. Use tag overlap analysis, category matching, keyword similarity, and limit to 10 related posts.

**Deliverables**:
- Related posts finder `src/extractors/related-posts.ts`
- Content similarity algorithm
- Tag/category matching
- Finder unit tests

**Acceptance Criteria**:
- Suggests up to 10 related documents
- Uses tag overlap for similarity
- Uses category matching
- Provides similarity scores
- Returns document titles
- Performance: <1s for 100 documents

---

#### CLI.1.17.0 - Create extraction orchestrator
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.5.0 through CLI.1.16.0

**Description**:
Create an extraction orchestrator that coordinates all extractors. Detect file type (Markdown, HTML, text), run appropriate extractors, aggregate results, handle errors gracefully, and provide extraction reports.

**Deliverables**:
- Extraction orchestrator `src/extractors/orchestrator.ts`
- File type detection
- Extractor coordination
- Error handling
- Orchestrator unit tests

**Acceptance Criteria**:
- Automatically detects file type
- Runs all applicable extractors
- Aggregates results into UrlMapping format
- Handles extractor failures gracefully
- Provides detailed extraction report
- Performance: <3s per document
- Supports batch extraction

**Technical Details**:
```typescript
async function extractMetadata(filePath: string): Promise<Partial<UrlMapping>> {
  const fileType = detectFileType(filePath);
  const content = await readFile(filePath);

  const results = await Promise.all([
    parseDocument(content, fileType),
    extractTags(content),
    generateSummary(content),
    extractQuotes(content),
    analyzeLinks(content),
    // ... other extractors
  ]);

  return aggregateResults(results);
}
```

---

#### CLI.1.18.0 - Write extraction integration tests
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.17.0

**Description**:
Create comprehensive integration tests for the extraction system. Test end-to-end extraction for Markdown, HTML, and text files. Test error handling, edge cases, and performance benchmarks.

**Deliverables**:
- Integration tests for extraction system
- Sample documents (Markdown, HTML, text)
- Performance benchmarks
- Test coverage report

**Acceptance Criteria**:
- Tests all file types (Markdown, HTML, text)
- Tests all extractors in combination
- Tests error handling (missing files, malformed content)
- Tests edge cases (empty files, huge files)
- Performance benchmarks documented
- 90%+ code coverage for extraction modules

---

## Phase 2: CLI Framework (64 hours)

### 2.1 Core CLI Commands

#### CLI.2.1.0 - Implement 'add' command with extraction
**Estimate**: 5 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.17.0

**Description**:
Enhance the existing 'add' command to support automatic metadata extraction. Add `--extract` flag to trigger extraction, validate URL and file path, run extraction orchestrator, and save results to config.

**Deliverables**:
- Enhanced `add` command in `src/cli.ts`
- `--extract` flag implementation
- Manual metadata options (--title, --author, --tags)
- Command unit tests

**Acceptance Criteria**:
- `url-ref add <url> <path>` works with manual metadata
- `url-ref add <url> <path> --extract` triggers extraction
- Validates URL format (HTTP/HTTPS)
- Validates file path exists
- Saves to configuration file
- Provides user feedback on extraction results
- Handles duplicate URLs based on config

**Technical Details**:
```bash
# Manual metadata
url-ref add https://example.com ./doc.md --title "Example" --author "John"

# Automatic extraction
url-ref add https://example.com ./doc.md --extract
```

---

#### CLI.2.2.0 - Implement 'update' command with re-extraction
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.1.0

**Description**:
Enhance the existing 'update' command to support metadata re-extraction. Add `--extract` flag to re-run extraction, support partial updates (--title, --author, etc.), and validate changes before saving.

**Deliverables**:
- Enhanced `update` command in `src/cli.ts`
- `--extract` flag for re-extraction
- Partial update support
- Command unit tests

**Acceptance Criteria**:
- `url-ref update <url>` updates existing mapping
- `url-ref update <url> --extract` re-runs extraction
- Supports partial updates (--title, --author, etc.)
- Validates URL exists in config
- Preserves unchanged fields
- Provides user feedback on changes

---

#### CLI.2.3.0 - Implement 'list' command with filtering
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.1.0

**Description**:
Enhance the 'list' command with advanced filtering and formatting. Support multiple output formats (table, JSON, CSV, compact), add filtering by property values, and add sorting options.

**Deliverables**:
- Enhanced `list` command in `src/cli.ts`
- Multiple output formats (table, JSON, CSV, compact)
- Filtering support (--filter "author=John")
- Sorting support (--sort, --order)
- Command unit tests

**Acceptance Criteria**:
- Default table format displays key fields
- `--format json` outputs valid JSON
- `--format csv` outputs valid CSV
- `--format compact` outputs single-line format
- `--filter` supports property=value syntax
- `--sort` supports all UrlMapping fields
- `--order` supports asc/desc

**Technical Details**:
```bash
url-ref list --format table
url-ref list --format json --filter "author=John"
url-ref list --sort wordCount --order desc
```

---

#### CLI.2.4.0 - Implement 'remove' command
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.1.0

**Description**:
Implement the 'remove' command to delete URL mappings. Support removal by URL, add confirmation prompt, support `--force` flag to skip confirmation, and create backup before removal.

**Deliverables**:
- `remove` command in `src/cli.ts`
- Confirmation prompt
- `--force` flag
- Automatic backup
- Command unit tests

**Acceptance Criteria**:
- `url-ref remove <url>` prompts for confirmation
- `url-ref remove <url> --force` skips confirmation
- Creates backup before removal
- Validates URL exists
- Provides user feedback
- Handles errors gracefully

---

#### CLI.2.5.0 - Implement 'remove-by-date' command
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.2.4.0

**Description**:
Implement the 'remove-by-date' command to remove mappings by date range. Support `--before`, `--after`, and `--between` options, validate ISO 8601 date formats, and show preview before removal.

**Deliverables**:
- `remove-by-date` command in `src/cli.ts`
- Date range filtering (--before, --after, --between)
- ISO 8601 date validation
- Preview and confirmation
- Command unit tests

**Acceptance Criteria**:
- `--before` removes entries before date
- `--after` removes entries after date
- `--between` removes entries in date range
- Validates ISO 8601 format
- Shows preview of entries to remove
- Requires confirmation unless `--force`

---

#### CLI.2.6.0 - Implement 'remove-by-property' command
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.2.4.0

**Description**:
Implement the 'remove-by-property' command to remove mappings by property values. Support any UrlMapping property, support comma-separated values, add case-sensitive option, and show preview before removal.

**Deliverables**:
- `remove-by-property` command in `src/cli.ts`
- Property-based filtering
- Multi-value support (comma-separated)
- Case-sensitive option
- Command unit tests

**Acceptance Criteria**:
- Supports any UrlMapping property
- Supports comma-separated values
- `--case-sensitive` flag for exact matching
- Shows preview of entries to remove
- Requires confirmation unless `--force`
- Handles invalid property names

---

#### CLI.2.7.0 - Implement 'remove-invalid' command
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.2.4.0

**Description**:
Implement the 'remove-invalid' command to remove mappings with invalid URLs or file paths. Validate URLs (HTTP/HTTPS format), validate file paths (existence), support `--urls`, `--paths`, `--both` options, and show validation report.

**Deliverables**:
- `remove-invalid` command in `src/cli.ts`
- URL validation
- File path validation
- Selective removal (--urls, --paths, --both)
- Command unit tests

**Acceptance Criteria**:
- `--urls` removes entries with invalid URLs
- `--paths` removes entries with invalid file paths
- `--both` removes entries with both invalid
- Validates HTTP/HTTPS URL format
- Checks file path existence
- Shows validation report
- Requires confirmation unless `--force`

---

### 2.2 Advanced CLI Commands

#### CLI.2.8.0 - Implement 'clean' command (interactive wizard)
**Estimate**: 6 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.2.7.0

**Description**:
Implement an interactive cleanup wizard that guides users through removing stale/invalid entries. Provide step-by-step prompts, show statistics, offer cleanup suggestions, and support automatic mode.

**Deliverables**:
- `clean` command in `src/cli.ts`
- Interactive wizard with prompts
- Automatic mode (--auto)
- Cleanup statistics
- Command unit tests

**Acceptance Criteria**:
- Interactive mode guides user through cleanup
- Shows statistics (total, invalid URLs, invalid paths, old entries)
- Offers cleanup suggestions
- `--auto` mode runs with defaults
- Creates backup before cleanup
- Provides detailed cleanup report

---

#### CLI.2.9.0 - Implement 'validate' command
**Estimate**: 5 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.2.0

**Description**:
Implement the 'validate' command to check all URL mappings for errors. Validate URLs (format and accessibility), validate file paths (existence), validate metadata (schema compliance), and generate validation report.

**Deliverables**:
- `validate` command in `src/cli.ts`
- URL validation (format + HTTP check)
- File path validation
- Metadata schema validation
- Validation report generation
- Command unit tests

**Acceptance Criteria**:
- Validates all URLs (format and HTTP status)
- Validates all file paths (existence)
- Validates metadata against schema
- `--urls` validates URLs only
- `--paths` validates paths only
- `--metadata` validates metadata only
- `--fix` attempts auto-fix
- `--report` saves report to file
- Exit code 0 if all valid, 1 if errors found

---

#### CLI.2.10.0 - Implement 'init' command
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.2.0

**Description**:
Implement the 'init' command to create a new configuration file. Support JSON and YAML formats, create default structure, add metadata (createdAt, author), and prevent overwriting existing files.

**Deliverables**:
- `init` command in `src/cli.ts`
- JSON format support
- YAML format support (optional)
- Default structure creation
- Command unit tests

**Acceptance Criteria**:
- `url-ref init` creates default JSON config
- `--format yaml` creates YAML config
- `--output` specifies custom path
- Prevents overwriting existing files
- Creates v2.0 schema structure
- Adds metadata (createdAt, version)

---

#### CLI.2.11.0 - Implement 'migrate' command
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.3.0

**Description**:
Implement the 'migrate' command to convert v1.0 configs to v2.0. Use migration utility from CLI.1.3.0, create backup of original, validate migrated config, and provide migration report.

**Deliverables**:
- `migrate` command in `src/cli.ts`
- Integration with migration utility
- Automatic backup creation
- Migration report
- Command unit tests

**Acceptance Criteria**:
- `url-ref migrate <input> <output>` migrates config
- Creates backup of input file
- Validates migrated config
- Provides detailed migration report
- `--no-backup` skips backup
- Handles migration errors gracefully

---

#### CLI.2.12.0 - Implement 'restore' command
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.2.11.0

**Description**:
Implement the 'restore' command to restore configuration from backup. List available backups, validate backup file, restore to original or custom location, and provide restore confirmation.

**Deliverables**:
- `restore` command in `src/cli.ts`
- Backup file validation
- Restore functionality
- Restore confirmation
- Command unit tests

**Acceptance Criteria**:
- `url-ref restore <backup>` restores from backup
- Validates backup file format
- `--output` specifies custom restore location
- Shows restore preview
- Requires confirmation
- Handles restore errors gracefully

---

### 2.3 CLI Infrastructure

#### CLI.2.13.0 - Implement global options (--config, --verbose, --debug)
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.1.0

**Description**:
Implement global CLI options that work with all commands. Add `--config` for custom config path, `--verbose` for detailed output, `--debug` for debug logging, `--dry-run` for preview mode, and `--no-backup` to skip backups.

**Deliverables**:
- Global options implementation
- Config path override (--config)
- Verbose logging (--verbose)
- Debug mode (--debug)
- Dry-run mode (--dry-run)
- No-backup option (--no-backup)
- Unit tests for global options

**Acceptance Criteria**:
- `--config <path>` uses custom config file
- `--verbose` shows detailed output
- `--debug` shows debug logs
- `--dry-run` previews changes without applying
- `--no-backup` skips automatic backups
- All options work with all commands
- Options can be combined

---

#### CLI.2.14.0 - Implement comprehensive help system
**Estimate**: 5 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.13.0

**Description**:
Create a comprehensive help system with command-specific help, usage examples, option descriptions, and quick reference guide. Support `--help` flag for all commands and `url-ref help <command>` syntax.

**Deliverables**:
- Help system implementation
- Command-specific help text
- Usage examples for all commands
- Quick reference guide
- Help unit tests

**Acceptance Criteria**:
- `url-ref --help` shows general help
- `url-ref <command> --help` shows command help
- `url-ref help <command>` shows command help
- Help includes usage, options, examples
- Help text is clear and concise
- Examples are practical and tested

---

#### CLI.2.15.0 - Implement error handling and user feedback
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.14.0

**Description**:
Implement comprehensive error handling and user feedback system. Provide clear error messages, suggest fixes for common errors, use color-coded output (errors=red, success=green, warnings=yellow), and implement progress indicators for long operations.

**Deliverables**:
- Error handling system
- User-friendly error messages
- Color-coded output (chalk)
- Progress indicators (ora, cli-progress)
- Feedback unit tests

**Acceptance Criteria**:
- All errors have clear, actionable messages
- Errors suggest fixes when possible
- Success messages are green
- Error messages are red
- Warnings are yellow
- Long operations show progress
- Exit codes are consistent

---

#### CLI.2.16.0 - Write CLI integration tests
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.15.0

**Description**:
Create comprehensive integration tests for all CLI commands. Test command execution, option parsing, error handling, user interactions, and end-to-end workflows.

**Deliverables**:
- Integration tests for all commands
- End-to-end workflow tests
- Error handling tests
- Mock user input tests
- Test coverage report

**Acceptance Criteria**:
- Tests all CLI commands
- Tests all command options
- Tests error scenarios
- Tests user interactions (prompts, confirmations)
- Tests end-to-end workflows
- 90%+ code coverage for CLI module

---

## Phase 3: Import/Export (32 hours)

### 3.1 Export Functionality

#### CLI.3.1.0 - Implement CSV export
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.1.0

**Description**:
Implement CSV export functionality to export URL mappings to CSV format. Support field selection, handle special characters (commas, quotes), support filtering, and generate proper CSV headers.

**Deliverables**:
- CSV export module `src/export/csv-exporter.ts`
- `export` command in `src/cli.ts`
- Field selection (--fields)
- Filtering support (--filter)
- Export unit tests

**Acceptance Criteria**:
- `url-ref export <output>` exports all mappings
- `--fields` selects specific fields
- `--filter` filters mappings before export
- Handles special characters correctly
- Generates proper CSV headers
- Validates output path
- Creates parent directories if needed

**Technical Details**:
```bash
url-ref export ./references.csv
url-ref export ./refs.csv --fields "title,url,author"
url-ref export ./refs.csv --filter "author=John"
```

---

#### CLI.3.2.0 - Implement JSON export
**Estimate**: 2 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.3.1.0

**Description**:
Implement JSON export functionality to export URL mappings to JSON format. Support pretty-printing, support field selection, support filtering, and validate JSON output.

**Deliverables**:
- JSON export module `src/export/json-exporter.ts`
- JSON export option in `export` command
- Pretty-print support
- Export unit tests

**Acceptance Criteria**:
- Exports valid JSON
- Supports pretty-printing (default)
- Supports field selection
- Supports filtering
- Validates output path

---

#### CLI.3.3.0 - Implement export filtering and field selection
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.3.2.0

**Description**:
Enhance export functionality with advanced filtering and field selection. Support multiple filter conditions, support field wildcards, validate field names, and provide export preview.

**Deliverables**:
- Advanced filtering logic
- Field selection validation
- Export preview
- Filter/selection unit tests

**Acceptance Criteria**:
- Supports multiple filter conditions
- Supports field wildcards (e.g., "author*")
- Validates field names
- Provides export preview with `--dry-run`
- Shows export statistics

---

#### CLI.3.4.0 - Write export unit tests
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.3.3.0

**Description**:
Create comprehensive unit tests for export functionality. Test CSV export, JSON export, field selection, filtering, and error handling.

**Deliverables**:
- Unit tests for CSV export
- Unit tests for JSON export
- Unit tests for filtering/selection
- Test coverage report

**Acceptance Criteria**:
- Tests CSV export with all options
- Tests JSON export with all options
- Tests field selection
- Tests filtering
- Tests error scenarios
- 100% code coverage for export modules

---

### 3.2 Import Functionality

#### CLI.3.5.0 - Implement CSV import
**Estimate**: 5 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.3.1.0

**Description**:
Implement CSV import functionality to import URL mappings from CSV files. Parse CSV with headers, validate data types, support merge mode, support replace mode, and handle import errors.

**Deliverables**:
- CSV import module `src/import/csv-importer.ts`
- `import` command in `src/cli.ts`
- Merge mode (--merge)
- Replace mode (default)
- Import unit tests

**Acceptance Criteria**:
- `url-ref import <input>` imports from CSV
- Parses CSV headers correctly
- Validates data types
- `--merge` merges with existing mappings
- Default mode replaces existing mappings
- `--validate` validates before import
- `--skip-errors` skips invalid rows
- Provides import report

**Technical Details**:
```bash
url-ref import ./references.csv
url-ref import ./refs.csv --merge
url-ref import ./refs.csv --skip-errors
```

---

#### CLI.3.6.0 - Implement JSON import
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.3.5.0

**Description**:
Implement JSON import functionality to import URL mappings from JSON files. Parse JSON structure, validate schema, support merge mode, and handle import errors.

**Deliverables**:
- JSON import module `src/import/json-importer.ts`
- JSON import option in `import` command
- Schema validation
- Import unit tests

**Acceptance Criteria**:
- Imports valid JSON files
- Validates JSON schema
- Supports merge mode
- Handles import errors
- Provides import report

---

#### CLI.3.7.0 - Implement import validation
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.3.6.0

**Description**:
Implement comprehensive import validation. Validate required fields, validate data types, validate URL formats, validate file paths, and provide detailed validation errors.

**Deliverables**:
- Import validation module
- Required field validation
- Data type validation
- Format validation
- Validation unit tests

**Acceptance Criteria**:
- Validates all required fields present
- Validates data types match schema
- Validates URL formats
- Validates date formats
- Provides detailed error messages
- `--skip-errors` continues on validation errors
- Shows validation summary

---

#### CLI.3.8.0 - Implement import merge logic
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.3.7.0

**Description**:
Implement merge logic for importing data. Detect duplicates by URL, support update-on-duplicate, support skip-on-duplicate, support error-on-duplicate, and provide merge report.

**Deliverables**:
- Merge logic implementation
- Duplicate detection
- Merge strategies
- Merge unit tests

**Acceptance Criteria**:
- Detects duplicates by URL
- `--merge` updates existing entries
- Default mode replaces all entries
- Provides merge statistics
- Shows conflicts and resolutions

---

#### CLI.3.9.0 - Implement import error handling
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.3.8.0

**Description**:
Implement comprehensive error handling for import operations. Handle file not found, handle invalid formats, handle validation errors, provide detailed error messages, and support partial imports.

**Deliverables**:
- Error handling system
- Error message templates
- Partial import support
- Error handling unit tests

**Acceptance Criteria**:
- Handles file not found errors
- Handles invalid CSV/JSON format
- Handles validation errors
- `--skip-errors` enables partial import
- Provides detailed error report
- Shows successful vs failed imports

---

#### CLI.3.10.0 - Write import integration tests
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.3.9.0

**Description**:
Create comprehensive integration tests for import functionality. Test CSV import, JSON import, merge modes, validation, and error handling.

**Deliverables**:
- Integration tests for CSV import
- Integration tests for JSON import
- Integration tests for merge modes
- Test coverage report

**Acceptance Criteria**:
- Tests CSV import end-to-end
- Tests JSON import end-to-end
- Tests merge vs replace modes
- Tests validation scenarios
- Tests error handling
- 90%+ code coverage for import modules

---

## Phase 4: Cleanup & Validation (40 hours)

### 4.1 Validation System

#### CLI.4.1.0 - Implement URL validator
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.2.0

**Description**:
Implement URL validation system. Validate URL format (HTTP/HTTPS), check URL accessibility (HTTP status), detect broken links, support timeout configuration, and provide validation report.

**Deliverables**:
- URL validator module `src/validators/url-validator.ts`
- Format validation
- Accessibility checking (HTTP HEAD request)
- Timeout configuration
- Validator unit tests

**Acceptance Criteria**:
- Validates HTTP/HTTPS format
- Checks URL accessibility (HTTP status 200-399)
- Detects broken links (404, 500, etc.)
- Supports timeout configuration
- Handles network errors gracefully
- Provides detailed validation report

---

#### CLI.4.2.0 - Implement file path validator
**Estimate**: 2 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.2.0

**Description**:
Implement file path validation system. Check file existence, validate file permissions, support absolute and relative paths, and provide validation report.

**Deliverables**:
- File path validator module `src/validators/path-validator.ts`
- Existence checking
- Permission validation
- Path resolution
- Validator unit tests

**Acceptance Criteria**:
- Checks file existence
- Validates read permissions
- Resolves relative paths correctly
- Handles symbolic links
- Provides detailed validation report

---

#### CLI.4.3.0 - Implement metadata validator
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.2.0

**Description**:
Implement metadata validation system. Validate against JSON schema, check required fields, validate data types, validate string lengths, validate array lengths, and provide validation report.

**Deliverables**:
- Metadata validator module `src/validators/metadata-validator.ts`
- Schema validation
- Field validation
- Type validation
- Validator unit tests

**Acceptance Criteria**:
- Validates against JSON schema
- Checks all required fields
- Validates data types
- Validates string length constraints
- Validates array length constraints
- Provides detailed validation report

---

#### CLI.4.4.0 - Implement validation orchestrator
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.4.1.0, CLI.4.2.0, CLI.4.3.0

**Description**:
Create validation orchestrator that coordinates all validators. Run validators in parallel, aggregate results, support selective validation (--urls, --paths, --metadata), and generate comprehensive validation report.

**Deliverables**:
- Validation orchestrator `src/validators/orchestrator.ts`
- Parallel validation execution
- Result aggregation
- Selective validation support
- Orchestrator unit tests

**Acceptance Criteria**:
- Runs all validators in parallel
- Aggregates validation results
- Supports selective validation
- Generates comprehensive report
- Performance: <5s for 100 mappings
- Handles validator failures gracefully

---

#### CLI.4.5.0 - Implement auto-fix functionality
**Estimate**: 5 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.4.4.0

**Description**:
Implement auto-fix functionality for common validation issues. Fix trailing slashes in URLs, normalize file paths, fix date formats, trim whitespace, and provide fix report.

**Deliverables**:
- Auto-fix module `src/validators/auto-fix.ts`
- URL normalization
- Path normalization
- Date format fixing
- Auto-fix unit tests

**Acceptance Criteria**:
- Fixes trailing slashes in URLs
- Normalizes file paths (resolve, normalize)
- Fixes date formats to ISO 8601
- Trims whitespace from strings
- `--fix` flag enables auto-fix
- Provides detailed fix report
- Creates backup before fixing

---

#### CLI.4.6.0 - Write validation integration tests
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.4.5.0

**Description**:
Create comprehensive integration tests for validation system. Test all validators, test orchestrator, test auto-fix, and test error handling.

**Deliverables**:
- Integration tests for validation system
- Tests for all validators
- Tests for auto-fix
- Test coverage report

**Acceptance Criteria**:
- Tests all validators end-to-end
- Tests validation orchestrator
- Tests auto-fix functionality
- Tests error scenarios
- 90%+ code coverage for validation modules

---

### 4.2 Cleanup System

#### CLI.4.7.0 - Implement duplicate detector
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.1.0

**Description**:
Implement duplicate detection system. Detect duplicate URLs, detect duplicate file paths, detect similar titles, and provide duplicate report.

**Deliverables**:
- Duplicate detector `src/cleanup/duplicate-detector.ts`
- URL duplicate detection
- Path duplicate detection
- Title similarity detection
- Detector unit tests

**Acceptance Criteria**:
- Detects exact URL duplicates
- Detects exact path duplicates
- Detects similar titles (fuzzy matching)
- Provides duplicate report with suggestions
- Shows merge suggestions

---

#### CLI.4.8.0 - Implement stale entry detector
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.1.1.0

**Description**:
Implement stale entry detection system. Detect old entries (by lastUpdated), detect entries with broken links, detect entries with missing files, and provide stale entry report.

**Deliverables**:
- Stale entry detector `src/cleanup/stale-detector.ts`
- Age-based detection
- Broken link detection
- Missing file detection
- Detector unit tests

**Acceptance Criteria**:
- Detects entries older than threshold
- Detects entries with broken links
- Detects entries with missing files
- Provides stale entry report
- Suggests cleanup actions

---

#### CLI.4.9.0 - Implement cleanup wizard
**Estimate**: 6 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.4.7.0, CLI.4.8.0

**Description**:
Implement interactive cleanup wizard. Guide user through cleanup steps, show statistics and suggestions, support automatic mode, and provide cleanup report.

**Deliverables**:
- Cleanup wizard `src/cleanup/wizard.ts`
- Interactive prompts
- Automatic mode
- Cleanup statistics
- Wizard unit tests

**Acceptance Criteria**:
- Interactive mode guides user
- Shows cleanup statistics
- Offers cleanup suggestions
- `--auto` mode runs with defaults
- Creates backup before cleanup
- Provides detailed cleanup report

---

### 4.3 Backup & Restore

#### CLI.4.10.0 - Implement automatic backup system
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.1.0

**Description**:
Implement automatic backup system for destructive operations. Create timestamped backups, store in .backups directory, support backup retention policy, and provide backup management.

**Deliverables**:
- Backup system `src/backup/backup-manager.ts`
- Automatic backup creation
- Backup retention policy
- Backup listing
- Backup unit tests

**Acceptance Criteria**:
- Creates backup before destructive operations
- Uses timestamped filenames
- Stores in .backups directory
- Supports retention policy (keep last N backups)
- `--no-backup` flag skips backup
- Lists available backups

---

#### CLI.4.11.0 - Implement restore functionality
**Estimate**: 3 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.4.10.0

**Description**:
Implement restore functionality to recover from backups. List available backups, validate backup files, restore to original or custom location, and provide restore confirmation.

**Deliverables**:
- Restore functionality in backup manager
- Backup listing
- Backup validation
- Restore confirmation
- Restore unit tests

**Acceptance Criteria**:
- Lists available backups with timestamps
- Validates backup file format
- Restores to original location by default
- `--output` specifies custom location
- Requires confirmation before restore
- Provides restore report

---

#### CLI.4.12.0 - Implement backup cleanup
**Estimate**: 2 hours
**Priority**: P3
**Type**: Task
**Dependencies**: CLI.4.11.0

**Description**:
Implement backup cleanup functionality. Remove old backups based on retention policy, support manual backup deletion, and provide cleanup report.

**Deliverables**:
- Backup cleanup functionality
- Retention policy enforcement
- Manual deletion support
- Cleanup unit tests

**Acceptance Criteria**:
- Removes backups older than retention period
- Supports manual backup deletion
- Keeps minimum number of backups
- Provides cleanup report
- Requires confirmation for manual deletion

---

#### CLI.4.13.0 - Write backup/restore integration tests
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.4.12.0

**Description**:
Create comprehensive integration tests for backup and restore functionality. Test automatic backups, restore operations, backup cleanup, and error handling.

**Deliverables**:
- Integration tests for backup system
- Integration tests for restore
- Integration tests for cleanup
- Test coverage report

**Acceptance Criteria**:
- Tests automatic backup creation
- Tests restore operations
- Tests backup cleanup
- Tests error scenarios
- 90%+ code coverage for backup modules

---

## Phase 5: Testing & Documentation (64 hours)

### 5.1 Unit Testing

#### CLI.5.1.0 - Write extractor unit tests
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.17.0

**Description**:
Create comprehensive unit tests for all extractor modules. Test Markdown parser, HTML parser, text parser, SEO extractor, summary generator, and all other extractors.

**Deliverables**:
- Unit tests for all extractors
- Mock data for testing
- Edge case tests
- Test coverage report

**Acceptance Criteria**:
- Tests all extractor modules
- Tests edge cases (empty, malformed, huge files)
- Tests error handling
- 100% code coverage for extractors
- Performance benchmarks documented

---

#### CLI.5.2.0 - Write validator unit tests
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.4.4.0

**Description**:
Create comprehensive unit tests for all validator modules. Test URL validator, path validator, metadata validator, and validation orchestrator.

**Deliverables**:
- Unit tests for all validators
- Mock data for testing
- Edge case tests
- Test coverage report

**Acceptance Criteria**:
- Tests all validator modules
- Tests edge cases
- Tests error handling
- 100% code coverage for validators

---

#### CLI.5.3.0 - Write CLI command unit tests
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.16.0

**Description**:
Create comprehensive unit tests for all CLI commands. Test command parsing, option handling, error messages, and user interactions.

**Deliverables**:
- Unit tests for all CLI commands
- Mock user input
- Error scenario tests
- Test coverage report

**Acceptance Criteria**:
- Tests all CLI commands
- Tests all command options
- Tests error scenarios
- Tests user interactions
- 100% code coverage for CLI module

---

#### CLI.5.4.0 - Write import/export unit tests
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.3.10.0

**Description**:
Create comprehensive unit tests for import and export functionality. Test CSV import/export, JSON import/export, filtering, and error handling.

**Deliverables**:
- Unit tests for import modules
- Unit tests for export modules
- Edge case tests
- Test coverage report

**Acceptance Criteria**:
- Tests all import/export modules
- Tests edge cases
- Tests error handling
- 100% code coverage for import/export

---

### 5.2 Integration Testing

#### CLI.5.5.0 - Write end-to-end workflow tests
**Estimate**: 8 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.5.4.0

**Description**:
Create end-to-end workflow tests that simulate real user scenarios. Test complete workflows (init, add, extract, validate, export), test error recovery, and test data integrity.

**Deliverables**:
- End-to-end workflow tests
- Real-world scenario tests
- Data integrity tests
- Test coverage report

**Acceptance Criteria**:
- Tests complete user workflows
- Tests error recovery scenarios
- Tests data integrity throughout workflows
- Tests backward compatibility
- Documents test scenarios

---

#### CLI.5.6.0 - Write performance tests
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.5.5.0

**Description**:
Create performance tests and benchmarks. Test extraction performance, validation performance, import/export performance, and establish performance baselines.

**Deliverables**:
- Performance test suite
- Benchmark scripts
- Performance baselines
- Performance report

**Acceptance Criteria**:
- Tests extraction performance (<3s per document)
- Tests validation performance (<5s for 100 mappings)
- Tests import/export performance
- Establishes performance baselines
- Documents performance requirements

---

#### CLI.5.7.0 - Write backward compatibility tests
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.5.5.0

**Description**:
Create backward compatibility tests to ensure v2.0 works with v1.0 configs. Test v1.0 config loading, test migration, test mixed version scenarios, and verify no breaking changes.

**Deliverables**:
- Backward compatibility test suite
- v1.0 sample configs
- Migration tests
- Compatibility report

**Acceptance Criteria**:
- Tests v1.0 config loading
- Tests migration from v1.0 to v2.0
- Tests mixed version scenarios
- Verifies no breaking changes
- Documents compatibility guarantees

---

#### CLI.5.8.0 - Write error handling tests
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.5.5.0

**Description**:
Create comprehensive error handling tests. Test all error scenarios, test error messages, test error recovery, and verify exit codes.

**Deliverables**:
- Error handling test suite
- Error scenario tests
- Exit code tests
- Error handling report

**Acceptance Criteria**:
- Tests all error scenarios
- Tests error message clarity
- Tests error recovery
- Verifies exit codes
- Documents error handling behavior

---

### 5.3 Documentation

#### CLI.5.9.0 - Write API documentation
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.17.0

**Description**:
Create comprehensive API documentation for all modules. Document all public functions, document all interfaces and types, provide usage examples, and generate API reference.

**Deliverables**:
- API documentation (JSDoc/TSDoc)
- API reference guide
- Usage examples
- Type definitions documentation

**Acceptance Criteria**:
- All public functions documented
- All interfaces and types documented
- Usage examples provided
- API reference generated (TypeDoc)
- Documentation is clear and complete

---

#### CLI.5.10.0 - Write CLI user guide
**Estimate**: 6 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.2.16.0

**Description**:
Create comprehensive CLI user guide. Document all commands, provide usage examples, document common workflows, and create quick reference guide.

**Deliverables**:
- CLI user guide (Markdown)
- Command reference
- Workflow examples
- Quick reference guide

**Acceptance Criteria**:
- All commands documented
- Usage examples for all commands
- Common workflows documented
- Quick reference guide created
- Documentation is beginner-friendly

---

#### CLI.5.11.0 - Write migration guide
**Estimate**: 4 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.1.3.0

**Description**:
Create migration guide for v1.0 to v2.0 upgrade. Document breaking changes (if any), document new features, provide migration steps, and include troubleshooting guide.

**Deliverables**:
- Migration guide (Markdown)
- Breaking changes documentation
- Migration steps
- Troubleshooting guide

**Acceptance Criteria**:
- Breaking changes documented
- New features documented
- Step-by-step migration guide
- Troubleshooting section
- Examples for common scenarios

---

#### CLI.5.12.0 - Write developer guide
**Estimate**: 6 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.5.9.0

**Description**:
Create developer guide for contributors. Document architecture, document coding standards, provide contribution guidelines, and document testing procedures.

**Deliverables**:
- Developer guide (Markdown)
- Architecture documentation
- Coding standards
- Contribution guidelines

**Acceptance Criteria**:
- Architecture documented
- Coding standards documented
- Contribution guidelines provided
- Testing procedures documented
- Setup instructions included

---

#### CLI.5.13.0 - Create usage examples
**Estimate**: 4 hours
**Priority**: P2
**Type**: Task
**Dependencies**: CLI.5.10.0

**Description**:
Create comprehensive usage examples for common scenarios. Provide real-world examples, create sample configs, document best practices, and create video tutorials (optional).

**Deliverables**:
- Usage examples (Markdown)
- Sample configuration files
- Best practices guide
- Tutorial scripts

**Acceptance Criteria**:
- Real-world examples provided
- Sample configs included
- Best practices documented
- Examples are tested and working
- Examples cover common use cases

---

#### CLI.5.14.0 - Update README.md
**Estimate**: 3 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.5.10.0

**Description**:
Update README.md with v2.0 information. Document new features, update installation instructions, update usage examples, and add badges (build status, coverage, version).

**Deliverables**:
- Updated README.md
- Feature highlights
- Updated installation instructions
- Updated usage examples

**Acceptance Criteria**:
- New features highlighted
- Installation instructions updated
- Usage examples updated
- Badges added (build, coverage, npm version)
- Links to documentation provided

---

#### CLI.5.15.0 - Update CHANGELOG.md
**Estimate**: 2 hours
**Priority**: P1
**Type**: Task
**Dependencies**: CLI.5.14.0

**Description**:
Update CHANGELOG.md with v2.0 release notes. Document all new features, document bug fixes, document breaking changes, and follow Keep a Changelog format.

**Deliverables**:
- Updated CHANGELOG.md
- v2.0.0 release notes
- Feature list
- Breaking changes list

**Acceptance Criteria**:
- Follows Keep a Changelog format
- All new features documented
- Breaking changes documented
- Bug fixes documented
- Migration notes included

---

#### CLI.5.16.0 - Generate documentation site
**Estimate**: 6 hours
**Priority**: P3
**Type**: Task
**Dependencies**: CLI.5.15.0

**Description**:
Generate documentation website using TypeDoc or similar. Create searchable documentation, deploy to GitHub Pages, add navigation, and include all guides.

**Deliverables**:
- Documentation website
- TypeDoc configuration
- GitHub Pages deployment
- Navigation structure

**Acceptance Criteria**:
- Documentation site generated
- Deployed to GitHub Pages
- Searchable documentation
- All guides included
- Mobile-friendly design

---

## Summary

### Total Project Statistics

- **Total Tasks**: 71
- **Total Estimated Hours**: 280 hours
- **Total Estimated Days**: 35 working days (8 hours/day)

### Phase Breakdown

| Phase | Tasks | Hours | Days |
|-------|-------|-------|------|
| Phase 1: Schema & Core Extraction | 18 | 80 | 10 |
| Phase 2: CLI Framework | 16 | 64 | 8 |
| Phase 3: Import/Export | 10 | 32 | 4 |
| Phase 4: Cleanup & Validation | 13 | 40 | 5 |
| Phase 5: Testing & Documentation | 16 | 64 | 8 |

### Critical Path

The critical path for this project follows the P1 priority tasks:

1. **Phase 1** (CLI.1.1.0 → CLI.1.4.0): Schema foundation
2. **Phase 1** (CLI.1.5.0 → CLI.1.17.0): Extraction system
3. **Phase 2** (CLI.2.1.0 → CLI.2.4.0): Core CLI commands
4. **Phase 2** (CLI.2.9.0 → CLI.2.11.0): Essential utilities
5. **Phase 2** (CLI.2.13.0 → CLI.2.16.0): CLI infrastructure
6. **Phase 3** (CLI.3.1.0, CLI.3.5.0, CLI.3.7.0): Import/Export core
7. **Phase 4** (CLI.4.1.0 → CLI.4.6.0): Validation system
8. **Phase 4** (CLI.4.10.0, CLI.4.13.0): Backup system
9. **Phase 5** (CLI.5.1.0 → CLI.5.8.0): Testing
10. **Phase 5** (CLI.5.9.0 → CLI.5.15.0): Documentation

### Milestones

1. **M1: Schema Complete** (CLI.1.4.0) - 9 hours
2. **M2: Extraction Complete** (CLI.1.18.0) - 71 hours
3. **M3: Core CLI Complete** (CLI.2.4.0) - 16 hours
4. **M4: Full CLI Complete** (CLI.2.16.0) - 64 hours
5. **M5: Import/Export Complete** (CLI.3.10.0) - 32 hours
6. **M6: Validation Complete** (CLI.4.6.0) - 20 hours
7. **M7: Cleanup Complete** (CLI.4.13.0) - 40 hours
8. **M8: Testing Complete** (CLI.5.8.0) - 40 hours
9. **M9: Documentation Complete** (CLI.5.16.0) - 64 hours
10. **M10: v2.0.0 Release** - 280 hours total

### Dependencies Graph

```
Phase 1 (Schema & Extraction)
├── CLI.1.1.0 → CLI.1.2.0 → CLI.1.3.0 → CLI.1.4.0 (Schema)
└── CLI.1.5.0 → CLI.1.17.0 (Extractors) → CLI.1.18.0 (Tests)

Phase 2 (CLI Framework)
├── CLI.2.1.0 → CLI.2.2.0 → CLI.2.3.0 → CLI.2.4.0 (Core Commands)
├── CLI.2.5.0 → CLI.2.7.0 (Removal Commands)
├── CLI.2.8.0 → CLI.2.12.0 (Advanced Commands)
└── CLI.2.13.0 → CLI.2.14.0 → CLI.2.15.0 → CLI.2.16.0 (Infrastructure)

Phase 3 (Import/Export)
├── CLI.3.1.0 → CLI.3.2.0 → CLI.3.3.0 → CLI.3.4.0 (Export)
└── CLI.3.5.0 → CLI.3.6.0 → CLI.3.7.0 → CLI.3.8.0 → CLI.3.9.0 → CLI.3.10.0 (Import)

Phase 4 (Cleanup & Validation)
├── CLI.4.1.0 → CLI.4.2.0 → CLI.4.3.0 → CLI.4.4.0 → CLI.4.5.0 → CLI.4.6.0 (Validation)
├── CLI.4.7.0 → CLI.4.8.0 → CLI.4.9.0 (Cleanup)
└── CLI.4.10.0 → CLI.4.11.0 → CLI.4.12.0 → CLI.4.13.0 (Backup/Restore)

Phase 5 (Testing & Documentation)
├── CLI.5.1.0 → CLI.5.4.0 (Unit Tests)
├── CLI.5.5.0 → CLI.5.8.0 (Integration Tests)
└── CLI.5.9.0 → CLI.5.16.0 (Documentation)
```

---

**End of Bead Tasks Document**


