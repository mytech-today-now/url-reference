# URL Reference Mapper v2.0 - Design Document

**Version:** 2.0.0  
**Date:** 2026-02-20  
**Status:** Proposed

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│  (Commander.js - User Interface)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Core Library Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         UrlReferenceMapper (Main Class)              │  │
│  │  - CRUD operations                                   │  │
│  │  - Validation orchestration                          │  │
│  │  - Persistence management                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
│  Extractors  │ │Validators │ │  Utilities │
│              │ │           │ │            │
│ - Markdown   │ │ - URL     │ │ - CSV      │
│ - HTML       │ │ - Path    │ │ - Backup   │
│ - Text       │ │ - Metadata│ │ - Migration│
└──────────────┘ └───────────┘ └────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
│   Parsers    │ │  Storage  │ │   Config   │
│              │ │           │ │            │
│ - unified    │ │ - JSON    │ │ - Options  │
│ - cheerio    │ │ - YAML    │ │ - Defaults │
│ - regex      │ │ - CSV     │ │ - Schema   │
└──────────────┘ └───────────┘ └────────────┘
```

---

## Design Principles

### 1. Backward Compatibility
- **Principle**: v2.0 must work with v1.0 configs without breaking
- **Implementation**: 
  - Auto-migration on load
  - Deprecated properties still supported
  - Graceful degradation

### 2. Separation of Concerns
- **Principle**: Each component has a single, well-defined responsibility
- **Implementation**:
  - Extractors: Document parsing and metadata extraction
  - Validators: Data validation and integrity checks
  - Utilities: Cross-cutting concerns (CSV, backup, etc.)
  - CLI: User interface and command orchestration

### 3. Extensibility
- **Principle**: Easy to add new extractors, validators, and commands
- **Implementation**:
  - Base classes for extractors and validators
  - Plugin-ready architecture (future)
  - Clear interfaces and contracts

### 4. Performance
- **Principle**: Fast operations, minimal overhead
- **Implementation**:
  - Lazy loading of extractors
  - Caching of parsed documents
  - Streaming for large files
  - Async operations where appropriate

### 5. Developer Experience
- **Principle**: Easy to use, hard to misuse
- **Implementation**:
  - TypeScript for type safety
  - Clear error messages
  - Comprehensive documentation
  - Helpful CLI feedback

---

## Component Design

### 1. Extractor System

#### Base Extractor

```typescript
abstract class BaseExtractor {
  abstract extract(content: string): Partial<UrlMapping>;
  
  protected extractWordCount(text: string): number;
  protected calculateReadingTime(wordCount: number, wpm: number): number;
  protected extractLinks(content: string): string[];
  protected extractQuotes(content: string): string[];
}
```

#### Specialized Extractors

```typescript
class MarkdownExtractor extends BaseExtractor {
  private parser: unified.Processor;
  
  extract(content: string): Partial<UrlMapping> {
    const ast = this.parser.parse(content);
    return {
      wordCount: this.extractWordCount(content),
      readingTime: this.calculateReadingTime(...),
      tags: this.extractTags(ast),
      quotes: this.extractQuotes(ast),
      internalLinks: this.extractInternalLinks(ast),
      externalLinks: this.extractExternalLinks(ast),
      summary: this.generateSummary(ast),
      tldr: this.generateTldr(ast)
    };
  }
  
  private extractTags(ast: Node): string;
  private extractInternalLinks(ast: Node): string[];
  // ... more methods
}
```

**Design Decisions:**
- **Why inheritance?** Common functionality (word count, reading time) shared across extractors
- **Why separate extractors?** Different parsing strategies for different formats
- **Why AST-based?** More reliable than regex for structured formats

### 2. Validation System

#### Validator Architecture

```typescript
interface Validator<T> {
  validate(data: T): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

class UrlValidator implements Validator<string> {
  validate(url: string): ValidationResult {
    // Check format
    // Optionally check accessibility
    // Return detailed results
  }
}

class PathValidator implements Validator<string> {
  validate(path: string): ValidationResult {
    // Check existence
    // Check permissions
    // Check file type
  }
}

class MetadataValidator implements Validator<UrlMapping> {
  private urlValidator: UrlValidator;
  private pathValidator: PathValidator;

  validate(mapping: UrlMapping): ValidationResult {
    // Validate all properties
    // Check constraints (array lengths, string lengths)
    // Aggregate results
  }
}
```

**Design Decisions:**
- **Why separate validators?** Single responsibility, reusable components
- **Why interface-based?** Easy to add new validators, testable
- **Why detailed results?** Better error messages, actionable feedback

### 3. CLI Command System

#### Command Structure

```typescript
interface Command {
  name: string;
  description: string;
  options: CommandOption[];
  action: (args: any, options: any) => Promise<void>;
}

class AddCommand implements Command {
  name = 'add';
  description = 'Add a new URL mapping with optional metadata extraction';

  options = [
    { flag: '--extract', description: 'Extract metadata from document' },
    { flag: '--title <title>', description: 'Specify title' },
    // ... more options
  ];

  async action(args: string[], options: any): Promise<void> {
    const mapper = new UrlReferenceMapper({ configPath: options.config });

    if (options.extract) {
      const metadata = await mapper.extractMetadata(args[1]);
      mapper.addMapping({ url: args[0], localPath: args[1], ...metadata });
    } else {
      mapper.addMapping({ url: args[0], localPath: args[1], title: options.title });
    }

    mapper.save();
    console.log('✓ Mapping added successfully');
  }
}
```

**Design Decisions:**
- **Why command pattern?** Encapsulation, testability, extensibility
- **Why async actions?** Support for I/O operations (file reading, extraction)
- **Why options object?** Flexible, easy to add new options

### 4. Data Flow

#### Add with Extraction Flow

```
User Input (CLI)
    │
    ▼
┌─────────────────────┐
│  AddCommand         │
│  - Parse arguments  │
│  - Validate inputs  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ UrlReferenceMapper  │
│ - Load config       │
│ - Check duplicates  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extractor Factory  │
│  - Detect format    │
│  - Select extractor │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ MarkdownExtractor   │
│ - Parse document    │
│ - Extract metadata  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ MetadataValidator   │
│ - Validate data     │
│ - Check constraints │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ UrlReferenceMapper  │
│ - Add mapping       │
│ - Save to file      │
└──────────┬──────────┘
           │
           ▼
    Success Message
```

---

## Data Models

### Core Types

```typescript
// Main mapping type
interface UrlMapping {
  // Required
  title: string;
  url: string;
  localPath: string;
  lastUpdated: string;

  // Optional metadata
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

// Configuration
interface MapperConfig {
  configPath?: string;
  mappings?: UrlMapping[];
  autoSave?: boolean;
  validateOnLoad?: boolean;
  allowDuplicates?: boolean;
  extraction?: ExtractionConfig;
  validation?: ValidationConfig;
  backup?: BackupConfig;
}

// Extraction configuration
interface ExtractionConfig {
  enabled: boolean;
  readingSpeed: number;
  maxTags: number;
  maxQuotes: number;
  generateSummary: boolean;
  aiProvider?: string;
}

// Validation configuration
interface ValidationConfig {
  checkUrls: boolean;
  checkPaths: boolean;
  strictMode: boolean;
}

// Backup configuration
interface BackupConfig {
  enabled: boolean;
  maxBackups: number;
  backupPath: string;
}
```

---

## Error Handling Strategy

### Error Hierarchy

```typescript
class UrlReferenceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'UrlReferenceError';
  }
}

class ValidationError extends UrlReferenceError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

class ExtractionError extends UrlReferenceError {
  constructor(message: string, public filePath: string) {
    super(message, 'EXTRACTION_ERROR');
  }
}

class ConfigError extends UrlReferenceError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
  }
}
```

### Error Handling Patterns

```typescript
// Graceful degradation
try {
  const metadata = await extractor.extract(content);
} catch (error) {
  logger.warn(`Extraction failed: ${error.message}`);
  // Continue with partial metadata
  return { wordCount: 0, readingTime: 0 };
}

// User-friendly CLI errors
try {
  mapper.addMapping(mapping);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`✗ Validation failed: ${error.message}`);
    console.error(`  Field: ${error.field}`);
    process.exit(1);
  }
  throw error;
}
```

---

## Performance Optimizations

### 1. Lazy Loading
- Load extractors only when needed
- Parse documents on-demand
- Cache parsed results

### 2. Streaming
- Stream large CSV files
- Process documents in chunks
- Avoid loading entire file into memory

### 3. Caching
```typescript
class UrlReferenceMapper {
  private extractionCache = new Map<string, Partial<UrlMapping>>();

  async extractMetadata(path: string): Promise<Partial<UrlMapping>> {
    const cacheKey = `${path}:${fs.statSync(path).mtimeMs}`;

    if (this.extractionCache.has(cacheKey)) {
      return this.extractionCache.get(cacheKey)!;
    }

    const metadata = await this.performExtraction(path);
    this.extractionCache.set(cacheKey, metadata);
    return metadata;
  }
}
```

### 4. Parallel Processing
```typescript
// Process multiple documents in parallel
async extractMultiple(paths: string[]): Promise<Partial<UrlMapping>[]> {
  return Promise.all(paths.map(path => this.extractMetadata(path)));
}
```

---

## Security Considerations

### 1. Path Traversal Prevention
```typescript
function validatePath(inputPath: string, basePath: string): boolean {
  const resolved = path.resolve(basePath, inputPath);
  return resolved.startsWith(basePath);
}
```

### 2. URL Validation
```typescript
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### 3. Input Sanitization
- Sanitize user inputs before processing
- Validate file types before parsing
- Limit file sizes to prevent DoS

### 4. Dependency Security
- Regular `npm audit` checks
- Pin dependency versions
- Review security advisories

---

## Testing Strategy

### Unit Tests
- Test each extractor independently
- Test each validator independently
- Test utility functions
- Mock file system operations

### Integration Tests
- Test complete workflows
- Test CLI commands end-to-end
- Test with real documents

### Performance Tests
- Benchmark extraction speed
- Test with large datasets (1000+ items)
- Memory usage profiling

### Compatibility Tests
- Test on Windows, macOS, Linux
- Test with Node.js 16, 18, 20
- Test with different document formats

---

## Future Enhancements (v3.0+)

### Plugin System
```typescript
interface ExtractorPlugin {
  name: string;
  fileTypes: string[];
  extract(content: string): Partial<UrlMapping>;
}

class UrlReferenceMapper {
  registerPlugin(plugin: ExtractorPlugin): void;
}
```

### Watch Mode
```typescript
mapper.watch({
  onChange: (mapping) => console.log('Updated:', mapping.url)
});
```

### Remote Sync
```typescript
mapper.sync({
  remote: 'https://api.example.com/references',
  apiKey: process.env.API_KEY
});
```

### AI Integration
```typescript
mapper.configure({
  extraction: {
    aiProvider: 'openai',
    apiKey: process.env.OPENAI_KEY,
    model: 'gpt-4'
  }
});
```

---

## Conclusion

This design provides:
- ✅ Backward compatibility with v1.0
- ✅ Extensible architecture for future enhancements
- ✅ Clear separation of concerns
- ✅ Comprehensive error handling
- ✅ Performance optimizations
- ✅ Security best practices
- ✅ Testable components

The modular design allows for incremental development and easy maintenance while providing a solid foundation for future growth.

