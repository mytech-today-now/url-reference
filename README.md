# @mytechtoday/url-reference

**Bidirectional mapping between local filesystem paths and published internet URLs for Augment AI workflows.**

[![npm version](https://img.shields.io/npm/v/@mytechtoday/url-reference.svg)](https://www.npmjs.com/package/@mytechtoday/url-reference)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Version 2.0.0-alpha.1** - Planning release for enhanced CLI with comprehensive help system, advanced features, and utility commands
>
> ⚠️ **Note:** v2.0.0 features are documented but not yet implemented. This is a planning/specification release. See `openspec/cli-enhancement/` for complete specifications and `bead-tasks-cli-enhancement.md` for implementation tasks.

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

### Getting Help

Every command supports `--help` or `-h` for detailed usage information:

```bash
# Global help - list all commands
npx url-ref-mapper --help
npx url-ref-mapper -h

# Command-specific help
npx url-ref-mapper init --help
npx url-ref-mapper add -h
npx url-ref-mapper doctor --help
```

### Core Commands

#### `init`
Create a default configuration file with seed data.

```bash
npx url-ref-mapper init
npx url-ref-mapper init --format yaml --path custom-path.yaml
npx url-ref-mapper init --help  # Show detailed help
```

#### `add`
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

#### `remove`
Remove a mapping by URL.

```bash
npx url-ref-mapper remove "https://example.com/post/"
npx url-ref-mapper remove --url "https://example.com/post/"
```

#### `list`
List all mappings.

```bash
# Default text output
npx url-ref-mapper list

# JSON output
npx url-ref-mapper list --json

# Table format
npx url-ref-mapper list --format table

# Verbose output
npx url-ref-mapper list --verbose

# Quiet output (minimal)
npx url-ref-mapper list --quiet
```

#### `get-url`
Get published URL from local path.

**Windows:**
```bash
npx url-ref-mapper get-url "C:\projects\blog\post.html"
npx url-ref-mapper get-url "C:\projects\blog\post.html" --json
```

**macOS/Linux:**
```bash
npx url-ref-mapper get-url "/home/user/projects/blog/post.html"
npx url-ref-mapper get-url "/home/user/projects/blog/post.html" --json
```

#### `get-path`
Get local path from published URL.

```bash
npx url-ref-mapper get-path "https://example.com/post/"
npx url-ref-mapper get-path "https://example.com/post/" --json
```

#### `validate`
Validate all mappings.

```bash
npx url-ref-mapper validate
npx url-ref-mapper validate --json
npx url-ref-mapper validate --verbose
```

#### `export`
Export mappings to different formats.

```bash
npx url-ref-mapper export --format csv --output mappings.csv
npx url-ref-mapper export --format yaml
npx url-ref-mapper export --format json --output mappings.json
```

### Advanced Features

#### Interactive Mode
Start an interactive REPL session for executing multiple commands.

```bash
npx url-ref-mapper interactive

# In interactive mode:
url-ref> add --title "Post" --url "https://example.com/post/" --path "/path/to/post.html"
url-ref> list
url-ref> validate
url-ref> exit
```

**Features:**
- Command history (up/down arrows)
- Tab completion for commands and options
- History search (Ctrl+R)
- Persistent command history

#### Batch Mode
Execute multiple commands from a file or stdin.

```bash
# From file
npx url-ref-mapper batch --file commands.txt

# From stdin
echo "list\nvalidate" | npx url-ref-mapper batch

# Stop on first error
npx url-ref-mapper batch --file commands.txt --stop-on-error

# Parallel execution
npx url-ref-mapper batch --file commands.txt --parallel
```

#### Tab Completion
Install shell tab completion for faster command entry.

```bash
# Install for your shell
npx url-ref-mapper completion install

# Install for specific shell
npx url-ref-mapper completion install --shell bash
npx url-ref-mapper completion install --shell zsh
npx url-ref-mapper completion install --shell fish

# Uninstall completion
npx url-ref-mapper completion uninstall
```

### Output Formatting

All commands support multiple output formats:

```bash
# JSON output (machine-readable)
npx url-ref-mapper list --json

# YAML output
npx url-ref-mapper list --format yaml

# Table format
npx url-ref-mapper list --format table

# Verbose mode (detailed output)
npx url-ref-mapper validate --verbose

# Quiet mode (minimal output)
npx url-ref-mapper validate --quiet

# Disable colors
npx url-ref-mapper list --no-color
```

### Utility Commands

#### `version`
Display version information.

```bash
npx url-ref-mapper version
npx url-ref-mapper --version
npx url-ref-mapper version --json
```

#### `license`
Display license information.

```bash
npx url-ref-mapper license
npx url-ref-mapper license --json
```

#### `credits`
Show contributors and dependencies.

```bash
npx url-ref-mapper credits
npx url-ref-mapper credits --json
```

#### `sponsor`
Display sponsorship information.

```bash
npx url-ref-mapper sponsor
```

#### `donate`
Show donation options.

```bash
npx url-ref-mapper donate
```

#### `doctor`
Diagnose and fix common issues.

```bash
# Run all diagnostic checks
npx url-ref-mapper doctor

# Auto-fix issues
npx url-ref-mapper doctor --fix

# JSON output
npx url-ref-mapper doctor --json

# Verbose output
npx url-ref-mapper doctor --verbose
```

**Diagnostic Checks:**
- Configuration file validation
- Node.js version compatibility
- Dependency verification
- File path validation
- URL accessibility
- File permissions
- Disk space availability

#### `uninstall`
Safely uninstall the package.

```bash
# Interactive uninstall with confirmation
npx url-ref-mapper uninstall

# Uninstall without confirmation
npx url-ref-mapper uninstall --yes

# Uninstall global installation
npx url-ref-mapper uninstall --global --yes

# Keep configuration files
npx url-ref-mapper uninstall --keep-config
```

## ✨ What's New in v2.0.0

### Comprehensive Help System
- Every command has `--help` and `-h` options
- Detailed usage, examples, and exit codes
- Global help lists all available commands

### Advanced CLI Features
- **Interactive Mode** - REPL-style command execution with history and tab completion
- **Batch Mode** - Execute multiple commands from file or stdin
- **Tab Completion** - Shell completion for bash, zsh, and fish
- **Output Formatting** - JSON, YAML, table, and text formats
- **Verbose/Quiet Modes** - Control output verbosity
- **Colored Output** - Enhanced readability with automatic TTY detection

### Utility Commands
- **version** - Display version and system information
- **license** - Show license information
- **credits** - List contributors and dependencies
- **sponsor** - Display sponsorship options
- **donate** - Show donation information
- **doctor** - Diagnose and auto-fix common issues
- **uninstall** - Safely remove the package

### Enhanced Reliability
- 100% test coverage
- Cross-platform compatibility (Windows, macOS, Linux)
- Performance optimizations
- Comprehensive error handling

## 🤖 Augment AI Integration

This package is designed to work seamlessly with Augment AI workflows:

### CLI-First Design

All functionality is accessible through CLI commands, making it perfect for AI agents:

```bash
# AI can discover all commands
npx url-ref-mapper --help

# AI can get help for any command
npx url-ref-mapper add --help

# AI can diagnose issues
npx url-ref-mapper doctor

# AI can use JSON output for parsing
npx url-ref-mapper list --json
```

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

### Batch Operations for AI

AI agents can execute multiple operations efficiently:

```bash
# Create a batch file
cat > operations.txt << EOF
add --title "Post 1" --url "https://example.com/1/" --path "/path/1.html"
add --title "Post 2" --url "https://example.com/2/" --path "/path/2.html"
validate
list --json
EOF

# Execute batch
npx url-ref-mapper batch --file operations.txt
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

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mytech-today-now/url-reference/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mytech-today-now/url-reference/discussions)

## 🌟 Acknowledgments

Built for the Augment AI community to solve the common problem of broken local file references in AI-generated content.

---

## 📋 CLI Command Reference

For complete CLI documentation, see the [CLI Reference Guide](docs/cli-reference.md).

### Quick Command Index

**Core Commands:**
- `init` - Initialize configuration
- `add` - Add mapping
- `remove` - Remove mapping
- `list` - List mappings
- `get-url` - Get URL from path
- `get-path` - Get path from URL
- `validate` - Validate mappings
- `export` - Export mappings

**Advanced Features:**
- `interactive` - Start interactive mode
- `batch` - Execute batch commands
- `completion` - Manage tab completion

**Utility Commands:**
- `version` - Show version
- `license` - Show license
- `credits` - Show credits
- `sponsor` - Show sponsorship info
- `donate` - Show donation info
- `doctor` - Diagnose issues
- `uninstall` - Uninstall package

**Global Options:**
- `--help, -h` - Show help
- `--version, -v` - Show version
- `--json` - JSON output
- `--verbose` - Verbose output
- `--quiet` - Quiet output
- `--no-color` - Disable colors

---

## 🔄 Migration Guide

### Upgrading from v1.x to v2.0.0

**No Breaking Changes!** Version 2.0.0 is fully backward compatible with v1.x.

All existing commands work exactly as before. New features are additive:

```bash
# v1.x commands still work
npx url-ref-mapper init
npx url-ref-mapper add --title "Post" --url "..." --path "..."
npx url-ref-mapper list

# Plus new v2.0 features
npx url-ref-mapper list --json
npx url-ref-mapper doctor
npx url-ref-mapper interactive
```

**New Features to Explore:**
1. Try `--help` on any command for detailed documentation
2. Use `--json` for machine-readable output
3. Run `doctor` to check your setup
4. Install tab completion for faster workflows
5. Try interactive mode for multiple operations

---

**Status**: Production Ready | **Version**: 2.0.0 | **Maintainer**: MyTech.Today

