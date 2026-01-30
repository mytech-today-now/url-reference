# @mytechtoday/url-reference

**Bidirectional mapping between local filesystem paths and published internet URLs for Augment AI workflows.**

[![npm version](https://img.shields.io/npm/v/@mytechtoday/url-reference.svg)](https://www.npmjs.com/package/@mytechtoday/url-reference)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Purpose

Eliminate broken local-file links in AI-generated content when publishing to the web. This package provides a clean, reusable solution for mapping local development paths to published URLs, specifically designed for:

- **Augment AI** workflows
- **OpenSpec** spec-driven development
- **Beads** issue tracking integration
- WordPress publishing
- Static site generation

## 🚀 Quick Start

### Installation

```bash
npm install @mytechtoday/url-reference
```

### Initialize Configuration

```bash
npx url-ref-mapper init
```

This creates a `url-references.json` file with seed data for 4 copper mining blog posts.

### Programmatic Usage

```typescript
import { UrlReferenceMapper } from '@mytechtoday/url-reference';

const mapper = new UrlReferenceMapper({
  configPath: './url-references.json'
});

// Get published URL from local path
// Windows
const url = mapper.getUrlFromLocalPath("C:\\projects\\blog\\post.html");
// macOS/Linux
const url = mapper.getUrlFromLocalPath("/home/user/projects/blog/post.html");
// → "https://mytech.today/published-url/"

// Reverse lookup
const path = mapper.getLocalPathFromUrl("https://mytech.today/published-url/");
// → "C:\\projects\\blog\\post.html" (Windows)
// → "/home/user/projects/blog/post.html" (macOS/Linux)

// Add new mapping
mapper.addMapping({
  title: "New Blog Post",
  url: "https://mytech.today/new-post/",
  localPath: "C:\\projects\\blog\\new-post.html"  // Windows
  // localPath: "/home/user/projects/blog/new-post.html"  // macOS/Linux
});

mapper.save();
```

## 📖 API Documentation

### `UrlReferenceMapper`

#### Constructor

```typescript
new UrlReferenceMapper(config?: UrlReferenceMapperConfig)
```

**Config Options:**
- `configPath?: string` - Path to JSON/YAML configuration file
- `mappings?: UrlMapping[]` - Inline mappings for testing
- `autoSave?: boolean` - Auto-save changes to config file (default: false)

#### Methods

##### `getUrlFromLocalPath(localPath: string): string | null`
Get published URL from local filesystem path.

##### `getLocalPathFromUrl(url: string): string | null`
Get local filesystem path from published URL.

##### `addMapping(mapping: UrlMapping): void`
Add a new URL-to-path mapping. Throws error if URL or path already exists.

##### `updateMapping(url: string, updates: Partial<UrlMapping>): void`
Update an existing mapping by URL.

##### `removeMapping(url: string): boolean`
Remove a mapping by URL. Returns true if removed.

##### `getAllMappings(): UrlMapping[]`
Get all mappings as an array.

##### `save(filePath?: string): void`
Save mappings to file (JSON or YAML based on extension).

##### `validate(): ValidationResult`
Validate all mappings. Returns errors and warnings.

##### `export(format: ExportFormat): string`
Export mappings to JSON, YAML, or CSV format.

### Types

```typescript
interface UrlMapping {
  title: string;
  url: string;
  localPath: string;
  lastUpdated?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

type ExportFormat = 'json' | 'yaml' | 'csv';
```

## 🔧 CLI Commands

### `init`
Create a default configuration file with seed data.

```bash
npx url-ref-mapper init
npx url-ref-mapper init --format yaml --path custom-path.yaml
```

### `add`
Add a new mapping.

**Windows:**
```bash
npx url-ref-mapper add ^
  --title "My Blog Post" ^
  --url "https://example.com/post/" ^
  --path "C:\projects\blog\post.html"
```

**macOS/Linux:**
```bash
npx url-ref-mapper add \
  --title "My Blog Post" \
  --url "https://example.com/post/" \
  --path "/home/user/projects/blog/post.html"
```

### `get-url`
Get published URL from local path.

**Windows:**
```bash
npx url-ref-mapper get-url "C:\projects\blog\post.html"
```

**macOS/Linux:**
```bash
npx url-ref-mapper get-url "/home/user/projects/blog/post.html"
```

### `get-path`
Get local path from published URL.

```bash
npx url-ref-mapper get-path "https://example.com/post/"
```

### `validate`
Validate all mappings.

```bash
npx url-ref-mapper validate
```

### `export`
Export mappings to different formats.

```bash
npx url-ref-mapper export --format csv --output mappings.csv
npx url-ref-mapper export --format yaml
```

## 🤖 Augment AI Integration

This package is designed to work seamlessly with Augment AI workflows:

### In OpenSpec Documents

Reference the package in your spec files:

```markdown
Use @mytechtoday/url-reference to resolve local paths to published URLs.
```

### In Beads Tasks

```bash
# Create a task that uses the mapper
bd create "Update URL mappings for new blog posts"

# In your code
import { UrlReferenceMapper } from '@mytechtoday/url-reference';
const mapper = new UrlReferenceMapper({ configPath: './url-references.json' });
```

### With Augment Extensions

This package works alongside `@mytechtoday/augment-extensions`:

```bash
# Install both
npm install -g @mytechtoday/augment-extensions
npm install @mytechtoday/url-reference

# Use together in your project
augx link coding-standards/typescript
```

## 📁 Configuration File Format

### JSON Format (default)

**Windows:**
```json
[
  {
    "title": "Copper ETFs and Investment Vehicles: 2026",
    "url": "https://mytech.today/copper-etfs-and-investment-vehicles-2026/",
    "localPath": "C:\\projects\\blogs\\copper-mining-part-4-etf-investment-vehicles.html",
    "lastUpdated": "2026-01-27T17:04:00-06:00"
  }
]
```

**macOS/Linux:**
```json
[
  {
    "title": "Copper ETFs and Investment Vehicles: 2026",
    "url": "https://mytech.today/copper-etfs-and-investment-vehicles-2026/",
    "localPath": "/home/user/projects/blogs/copper-mining-part-4-etf-investment-vehicles.html",
    "lastUpdated": "2026-01-27T17:04:00-06:00"
  }
]
```

### YAML Format

**Windows:**
```yaml
- title: Copper ETFs and Investment Vehicles: 2026
  url: https://mytech.today/copper-etfs-and-investment-vehicles-2026/
  localPath: C:\projects\blogs\copper-mining-part-4-etf-investment-vehicles.html
  lastUpdated: '2026-01-27T17:04:00-06:00'
```

**macOS/Linux:**
```yaml
- title: Copper ETFs and Investment Vehicles: 2026
  url: https://mytech.today/copper-etfs-and-investment-vehicles-2026/
  localPath: /home/user/projects/blogs/copper-mining-part-4-etf-investment-vehicles.html
  lastUpdated: '2026-01-27T17:04:00-06:00'
```

## 🌍 Cross-Platform Support

This package works seamlessly across **Windows**, **macOS**, and **Linux** platforms.

### Path Format Guidelines

**Windows:**
- Use backslashes: `C:\projects\blog\post.html`
- Or forward slashes: `C:/projects/blog/post.html`
- Both formats are supported and normalized internally

**macOS/Linux:**
- Use forward slashes: `/home/user/projects/blog/post.html`
- Absolute paths recommended for consistency

### Platform-Specific Examples

**Windows (PowerShell):**
```powershell
# Initialize config
npx url-ref-mapper init

# Add mapping
npx url-ref-mapper add `
  --title "My Post" `
  --url "https://example.com/post/" `
  --path "C:\projects\blog\post.html"

# Get URL
npx url-ref-mapper get-url "C:\projects\blog\post.html"
```

**macOS/Linux (Bash/Zsh):**
```bash
# Initialize config
npx url-ref-mapper init

# Add mapping
npx url-ref-mapper add \
  --title "My Post" \
  --url "https://example.com/post/" \
  --path "/home/user/projects/blog/post.html"

# Get URL
npx url-ref-mapper get-url "/home/user/projects/blog/post.html"
```

## 🧪 Testing

```bash
npm test
npm run test:coverage
```

## 🛠 Development

```bash
# Clone the repository
git clone https://github.com/mytech-today-now/url-reference.git
cd url-reference

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

## 📦 Publishing

```bash
# Build and test
npm run build
npm test

# Publish to npm
npm publish
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Augment Code AI](https://www.augmentcode.com/) - AI coding assistant
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) - Spec-driven development
- [Beads](https://github.com/steveyegge/beads) - Distributed issue tracker
- [Augment Extensions](https://github.com/mytech-today-now/augment) - Extension modules for Augment AI

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mytech-today-now/url-reference/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mytech-today-now/url-reference/discussions)

## 🌟 Acknowledgments

Built for the Augment AI community to solve the common problem of broken local file references in AI-generated content.

---

**Status**: Production Ready | **Version**: 1.0.0 | **Maintainer**: MyTech.Today

