# CLI Enhancement - Technical Design

**Project:** URL Reference Mapper CLI Enhancement  
**Version:** 2.0.0  
**Date:** 2026-02-20  

---

## Architecture Overview

The CLI enhancement follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI Entry Point                       │
│                      (src/cli.ts)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│  Command Parser │      │  Help System    │
│  (Commander.js) │      │  (help.ts)      │
└───────┬────────┘      └────────┬────────┘
        │                         │
        │         ┌───────────────┴───────────────┐
        │         │                               │
┌───────▼─────────▼──────┐              ┌────────▼────────┐
│  Command Handlers       │              │  Help Renderer  │
│  - add, remove, list    │              │  - templates    │
│  - validate, export     │              │  - formatters   │
│  - doctor, uninstall    │              └─────────────────┘
└───────┬─────────────────┘
        │
        ├─────────────┬─────────────┬─────────────┬──────────────┐
        │             │             │             │              │
┌───────▼──────┐ ┌───▼────┐ ┌─────▼─────┐ ┌─────▼──────┐ ┌────▼─────┐
│ Interactive  │ │ Batch  │ │ Tab       │ │ Output     │ │ Doctor   │
│ Mode         │ │ Mode   │ │ Completion│ │ Formatters │ │ Checks   │
│ (repl.ts)    │ │(batch) │ │ (tabtab)  │ │ (output)   │ │ (doctor) │
└──────────────┘ └────────┘ └───────────┘ └────────────┘ └──────────┘
```

---

## Module Design

### 1. Help System (`src/cli/help.ts`)

**Purpose:** Centralized help text management and rendering

**Components:**
- `HelpTemplate` - Template for help text
- `HelpRenderer` - Renders help text with formatting
- `HelpRegistry` - Stores help text for all commands

**Interface:**
```typescript
interface HelpTemplate {
  command: string;
  description: string;
  usage: string;
  options: HelpOption[];
  examples: string[];
  exitCodes: ExitCode[];
  relatedCommands: string[];
}

interface HelpOption {
  flags: string;
  description: string;
  defaultValue?: string;
}

interface ExitCode {
  code: number;
  description: string;
}

class HelpRenderer {
  renderFull(template: HelpTemplate): string;
  renderBrief(template: HelpTemplate): string;
  renderGlobal(commands: HelpTemplate[]): string;
}
```

---

### 2. Interactive Mode (`src/cli/interactive.ts`)

**Purpose:** REPL-style command execution

**Components:**
- `InteractiveSession` - Manages REPL session
- `CommandHistory` - Stores command history
- `AutoCompleter` - Provides auto-completion

**Interface:**
```typescript
class InteractiveSession {
  start(): Promise<void>;
  executeCommand(cmd: string): Promise<void>;
  stop(): void;
}

class CommandHistory {
  add(cmd: string): void;
  get(index: number): string;
  search(pattern: string): string[];
}
```

---

### 3. Batch Mode (`src/cli/batch.ts`)

**Purpose:** Execute multiple commands from file or script

**Interface:**
```typescript
interface BatchOptions {
  file?: string;
  commands?: string[];
  stopOnError?: boolean;
  parallel?: boolean;
}

class BatchExecutor {
  execute(options: BatchOptions): Promise<BatchResult>;
}

interface BatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: CommandResult[];
}
```

---

### 4. Tab Completion (`src/cli/completion.ts`)

**Purpose:** Shell tab completion support

**Components:**
- `CompletionInstaller` - Installs completion scripts
- `CompletionProvider` - Provides completion suggestions

**Interface:**
```typescript
class CompletionInstaller {
  install(shell: 'bash' | 'zsh' | 'fish'): Promise<void>;
  uninstall(shell: 'bash' | 'zsh' | 'fish'): Promise<void>;
}

class CompletionProvider {
  getCommands(): string[];
  getOptions(command: string): string[];
  getFiles(pattern: string): string[];
}
```

---

### 5. Output Formatters (`src/cli/output.ts`)

**Purpose:** Format output in different formats

**Interface:**
```typescript
interface OutputOptions {
  format: 'text' | 'json' | 'yaml' | 'table';
  verbose: boolean;
  quiet: boolean;
  color: boolean;
}

class OutputFormatter {
  format(data: any, options: OutputOptions): string;
  table(data: any[], columns: string[]): string;
  json(data: any, pretty: boolean): string;
  yaml(data: any): string;
}
```

---

### 6. Doctor Command (`src/cli/doctor.ts`)

**Purpose:** Diagnose and fix common issues

**Components:**
- `DiagnosticCheck` - Base class for checks
- `DiagnosticRunner` - Runs all checks
- `AutoFixer` - Attempts to fix issues

**Interface:**
```typescript
abstract class DiagnosticCheck {
  abstract name: string;
  abstract run(): Promise<CheckResult>;
  abstract fix?(): Promise<FixResult>;
}

interface CheckResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
}

class DiagnosticRunner {
  registerCheck(check: DiagnosticCheck): void;
  runAll(): Promise<DiagnosticReport>;
}

interface DiagnosticReport {
  checks: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}
```

**Built-in Checks:**
1. `ConfigFileCheck` - Validates configuration file
2. `NodeVersionCheck` - Checks Node.js version
3. `DependencyCheck` - Verifies dependencies
4. `FilePathCheck` - Validates file paths
5. `UrlCheck` - Tests URL accessibility
6. `PermissionCheck` - Checks file permissions
7. `DiskSpaceCheck` - Verifies disk space

---

## Design Decisions

### 1. CLI Framework: Commander.js

**Decision:** Continue using Commander.js  
**Rationale:**
- Already in use, no migration needed
- Excellent TypeScript support
- Built-in help system (can be customized)
- Active maintenance and community

**Alternatives Considered:**
- `yargs` - More features but heavier
- `oclif` - Too opinionated for our needs
- Custom parser - Unnecessary complexity

---

### 2. Interactive Mode: Node.js REPL

**Decision:** Use Node.js built-in `repl` module with `inquirer` for prompts  
**Rationale:**
- Native Node.js support
- No additional dependencies for core REPL
- `inquirer` provides rich prompts when needed
- Full control over behavior

**Alternatives Considered:**
- `vorpal` - Unmaintained
- `oclif` - Too heavy for our needs
- Custom REPL - Reinventing the wheel

---

### 3. Tab Completion: tabtab

**Decision:** Use `tabtab` for tab completion  
**Rationale:**
- Supports bash, zsh, fish
- Easy integration with Commander.js
- Active maintenance
- Good documentation

**Alternatives Considered:**
- `omelette` - Less maintained
- Manual scripts - Too much work
- `completion` - Limited shell support

---

### 4. Output Formatting: Multiple Libraries

**Decision:** Use specialized libraries for each format  
**Rationale:**
- `chalk` - Industry standard for colors
- `cli-table3` - Best table formatting
- `boxen` - Beautiful boxed messages
- Each library does one thing well

**Alternatives Considered:**
- Single library (e.g., `blessed`) - Too heavy
- Custom formatters - Reinventing the wheel

---

### 5. Testing Strategy: Jest + Integration Tests

**Decision:** Jest for unit tests, custom integration tests for CLI  
**Rationale:**
- Jest already in use
- Excellent TypeScript support
- Built-in coverage reporting
- Easy to mock dependencies

**Test Structure:**
```
src/__tests__/
├── unit/
│   ├── help.test.ts
│   ├── interactive.test.ts
│   ├── batch.test.ts
│   ├── completion.test.ts
│   ├── output.test.ts
│   └── doctor.test.ts
├── integration/
│   ├── cli.integration.test.ts
│   ├── help-system.integration.test.ts
│   ├── interactive-mode.integration.test.ts
│   └── doctor-command.integration.test.ts
└── e2e/
    ├── cross-platform.test.ts
    └── performance.test.ts
```

---

## File Structure

```
src/
├── cli.ts                    # Main CLI entry point
├── cli/
│   ├── help.ts              # Help system
│   ├── interactive.ts       # Interactive mode
│   ├── batch.ts             # Batch execution
│   ├── completion.ts        # Tab completion
│   ├── output.ts            # Output formatters
│   ├── doctor.ts            # Doctor command
│   └── commands/
│       ├── version.ts       # Version command
│       ├── license.ts       # License command
│       ├── credits.ts       # Credits command
│       ├── sponsor.ts       # Sponsor command
│       ├── donate.ts        # Donate command
│       └── uninstall.ts     # Uninstall command
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Performance Considerations

### Response Time Targets
- Help commands: <100ms
- Version command: <50ms
- Doctor command: <5s (for large configs)
- Interactive mode startup: <500ms
- Tab completion: <200ms

### Optimization Strategies
1. Lazy loading of heavy dependencies
2. Caching of help text
3. Parallel execution of doctor checks
4. Streaming output for large datasets
5. Minimal startup overhead

---

## Security Considerations

1. **Input Validation** - Sanitize all user input
2. **File Permissions** - Check before reading/writing files
3. **Command Injection** - Prevent shell injection in batch mode
4. **Dependency Audit** - Regular security audits of dependencies
5. **Safe Uninstall** - Prevent accidental data loss

---

## Backward Compatibility

All existing CLI commands must continue to work without changes. New features are additive only.

**Breaking Changes:** None  
**Deprecations:** None  
**New Features:** All new commands and options are opt-in

