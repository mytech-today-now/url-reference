# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-alpha.2] - 2026-02-20

### Added
- **`update` command** - Update the CLI to the latest version
  - Checks current version against npm registry
  - Supports `--global` flag for global installations
  - Provides clear feedback on update status
- **`self-update` command** - Alias for `update` command (backward compatibility)

### Changed
- **Renamed** `update <url>` command to `update-mapping <url>` to avoid conflicts with new `update` command
  - All functionality remains the same
  - Updates existing URL-to-path mappings with new title, URL, or path

### Fixed
- Command naming conflicts between CLI update and mapping update operations

## [2.0.0-alpha.1] - 2026-02-20

### Added - Planning Release
- Comprehensive documentation for planned v2.0.0 CLI enhancements
- Detailed specification in `openspec/cli-enhancement/` directory
- Bead tasks for implementation tracking

**Note**: This is a planning/specification release. Features documented below are planned but not yet implemented.

## [2.0.0] - 2026-02-20 (PLANNED)

### Added - Comprehensive CLI Enhancement

#### Help System
- `--help` and `-h` options for all commands
- Global help command listing all available commands
- Detailed help text with usage, examples, and exit codes
- Command-specific help with related commands

#### Advanced CLI Features
- **Interactive Mode** - REPL-style command execution
  - Command history with up/down arrow navigation
  - Tab completion for commands and options
  - History search with Ctrl+R
  - Persistent command history across sessions
- **Batch Mode** - Execute multiple commands from file or stdin
  - Support for command chaining with `&&` and `||`
  - Parallel execution with `--parallel` flag
  - Stop-on-error option
- **Tab Completion** - Shell completion support
  - Bash completion script
  - Zsh completion script
  - Fish completion script
  - Easy install/uninstall via `completion` command

#### Output Formatting
- Multiple output formats: text, JSON, YAML, table
- `--json` flag for machine-readable output
- `--verbose` flag for detailed output
- `--quiet` flag for minimal output
- `--no-color` flag to disable colored output
- Automatic TTY detection for color support
- Pretty-printed JSON output

#### Utility Commands
- `version` - Display version and system information
- `license` - Show license information
- `credits` - List contributors and dependencies
- `sponsor` - Display sponsorship options
- `donate` - Show donation information
- `doctor` - Diagnose and auto-fix common issues
  - Configuration file validation
  - Node.js version compatibility check
  - Dependency verification
  - File path validation
  - URL accessibility testing
  - File permissions check
  - Disk space availability check
  - Auto-fix capability with `--fix` flag
- `uninstall` - Enhanced uninstall with cleanup options

#### Enhanced Existing Commands
- `list` - Now supports `--format`, `--json`, `--verbose`, `--quiet`
- `validate` - Now supports `--json`, `--verbose` output
- `export` - Enhanced with more format options
- `remove` - Improved with better error messages
- All commands now support `--help`

### Changed
- Updated README.md with comprehensive CLI v2.0.0 documentation
- Enhanced package description
- Improved error messages across all commands
- Better cross-platform path handling
- Performance optimizations for all commands

### Technical Improvements
- 100% test coverage target
- Comprehensive integration tests
- Cross-platform compatibility testing (Windows, macOS, Linux)
- Performance benchmarks for all commands
- Enhanced error handling and validation
- Modular architecture for maintainability

### Documentation
- Complete OpenSpec documentation in `openspec/cli-enhancement/`
  - proposal.md - Business case and objectives
  - design.md - Technical architecture
  - tasks.md - Detailed task breakdown
  - deltas.md - Changes from v1.x
- Detailed task breakdown in `bead-tasks-cli-enhancement.md`
- Migration guide for v1.x users
- CLI reference documentation

### For Augment AI Integration
- CLI-first design for AI agent interaction
- Comprehensive help system for discoverability
- JSON output for all commands
- Doctor command for self-diagnosis
- Batch mode for complex workflows
- 100% test coverage for reliability

### Backward Compatibility
- **No breaking changes** - All v1.x commands work exactly as before
- New features are additive only
- Existing configurations remain compatible
- Programmatic API unchanged

## [1.3.0] - 2026-01-30

### Added
- CLI `version` command for displaying current version information
- `VERSION` constant exported from main package for programmatic access
- Centralized version management in `src/version.ts`

### Changed
- CLI now uses VERSION constant instead of hardcoded version string
- Version information is now available both via `version` command and `--version` flag

## [1.2.0] - 2026-01-30

### Added
- CLI `uninstall` command for removing the package from the system
  - Supports both local and global installations with `--global` flag
  - Includes confirmation prompt for safety (bypass with `--yes` flag)
- CLI `self-update` command for updating the CLI to the latest version
  - Checks current version against npm registry
  - Supports both local and global installations with `--global` flag
  - Shows version comparison before updating

### Changed
- Enhanced CLI with package management capabilities

## [1.1.0] - 2026-01-30

### Added
- CLI `update` command for updating existing URL-to-path mappings
- CLI `delete` command for removing URL-to-path mappings
- Complete CRUD (Create, Read, Update, Delete) functionality via CLI

### Changed
- Enhanced CLI with full CRUD operations for managing reference entries

## [1.0.0] - 2026-01-28

### Added
- Initial release of @mytechtoday/url-reference-mapper
- Core `UrlReferenceMapper` class with bidirectional lookup
- Support for JSON and YAML configuration files
- CLI commands: `init`, `add`, `get-url`, `get-path`, `validate`, `export`
- TypeScript declarations for full type safety
- Seed data with 4 copper mining blog post mappings
- Export functionality to JSON, YAML, and CSV formats
- Comprehensive validation with errors and warnings
- MIT License

### Features
- Bidirectional mapping between local paths and published URLs
- Auto-save functionality for programmatic updates
- Duplicate detection for URLs and paths
- Path normalization for cross-platform compatibility
- ISO 8601 timestamps for tracking updates
- Integration-ready for Augment AI, OpenSpec, and beads workflows

[1.0.0]: https://github.com/mytech-today-now/url-reference-mapper/releases/tag/v1.0.0

