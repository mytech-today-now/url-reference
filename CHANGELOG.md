# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

