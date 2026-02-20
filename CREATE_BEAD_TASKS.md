# Quick Guide: Creating Bead Tasks for CLI Enhancement

## Prerequisites

1. Ensure beads database is working: `bd doctor`
2. If database has issues, run: `bd init`
3. Review the task file: `bead-tasks-cli-enhancement.md`

## Step 1: Create the Epic

```bash
bd create "CLI Enhancement v2.0.0" \
  --type epic \
  --priority 1 \
  --estimate 11100 \
  --description "Complete implementation of comprehensive CLI help system and utility commands. Includes help system, output formatting, tab completion, interactive mode, batch mode, utility commands, doctor command, and comprehensive testing. Target: 8 weeks, 185 hours total. Reference: openspec/cli-enhancement/ and bead-tasks-cli-enhancement.md"
```

**Save the epic ID** (e.g., `bd-abc123`) - you'll need it for creating child tasks.

## Step 2: Create Phase 1 Tasks

Replace `<EPIC_ID>` with your actual epic ID:

### Task 1: Create OpenSpec documentation
```bash
bd create "Create OpenSpec documentation" \
  --type task \
  --priority 1 \
  --estimate 240 \
  --parent <EPIC_ID> \
  --labels "phase-1,planning,documentation" \
  --description "Create complete OpenSpec documentation structure for CLI enhancement project. Deliverables: proposal.md, README.md, design.md, deltas.md, tasks.md. See bead-tasks-cli-enhancement.md for full details."
```

### Task 2: Design technical architecture
```bash
bd create "Design technical architecture" \
  --type task \
  --priority 1 \
  --estimate 240 \
  --parent <EPIC_ID> \
  --labels "phase-1,planning,architecture" \
  --description "Finalize technical architecture and design decisions for CLI enhancement. Deliverables: Updated design.md with final architecture decisions, architecture diagrams, interface definitions. See bead-tasks-cli-enhancement.md for full details."
```

### Task 3: Set up project structure
```bash
bd create "Set up project structure" \
  --type task \
  --priority 1 \
  --estimate 120 \
  --parent <EPIC_ID> \
  --labels "phase-1,setup,infrastructure" \
  --description "Create directory structure and base files for CLI enhancement implementation. Deliverables: src/cli/ directory structure, src/__tests__/cli/ directory structure, base TypeScript files with interfaces. See bead-tasks-cli-enhancement.md for full details."
```

### Task 4: Install dependencies
```bash
bd create "Install dependencies" \
  --type task \
  --priority 1 \
  --estimate 60 \
  --parent <EPIC_ID> \
  --labels "phase-1,setup,dependencies" \
  --description "Install all new dependencies required for CLI enhancement features. New dependencies: chalk, inquirer, ora, cli-table3, boxen, tabtab, c8, @types/inquirer. See bead-tasks-cli-enhancement.md for full details."
```

## Step 3: Create Remaining Phases

For each remaining phase (2-11), create tasks following the same pattern:

```bash
bd create "<TASK_NAME>" \
  --type task \
  --priority <1|2|3> \
  --estimate <MINUTES> \
  --parent <EPIC_ID> \
  --labels "<phase-X,category,subcategory>" \
  --description "<Brief description>. See bead-tasks-cli-enhancement.md for full details."
```

## Task Creation Template

Use this template for each task:

```bash
bd create "TASK_NAME_HERE" \
  --type task \
  --priority PRIORITY_HERE \
  --estimate ESTIMATE_HERE \
  --parent EPIC_ID_HERE \
  --labels "LABELS_HERE" \
  --description "DESCRIPTION_HERE. See bead-tasks-cli-enhancement.md for full details."
```

## Quick Reference: All Task Names

### Phase 1 (4 tasks)
1. Create OpenSpec documentation
2. Design technical architecture
3. Set up project structure
4. Install dependencies

### Phase 2 (5 tasks)
5. Implement HelpRenderer
6. Implement HelpRegistry
7. Add help to existing commands
8. Implement global help
9. Write help system tests

### Phase 3 (5 tasks)
10. Implement OutputFormatter
11. Add JSON output support
12. Add verbose/quiet modes
13. Add color support
14. Write output formatter tests

### Phase 4 (6 tasks)
15. Implement CompletionProvider
16. Implement CompletionInstaller
17. Create bash completion script
18. Create zsh completion script
19. Create fish completion script
20. Write tab completion tests

### Phase 5 (5 tasks)
21. Implement InteractiveSession
22. Implement CommandHistory
23. Add auto-completion in REPL
24. Add command history navigation
25. Write interactive mode tests

### Phase 6 (4 tasks)
26. Implement BatchExecutor
27. Add command chaining support
28. Add parallel execution
29. Write batch mode tests

### Phase 7 (6 tasks)
30. Implement version command
31. Implement license command
32. Implement credits command
33. Implement sponsor command
34. Implement donate command
35. Write utility command tests

### Phase 8 (10 tasks)
36. Implement DiagnosticRunner
37. Implement ConfigFileCheck
38. Implement NodeVersionCheck
39. Implement DependencyCheck
40. Implement FilePathCheck
41. Implement UrlCheck
42. Implement PermissionCheck
43. Implement DiskSpaceCheck
44. Implement AutoFixer
45. Write doctor command tests

### Phase 9 (4 tasks)
46. Implement uninstall command
47. Add confirmation prompts
48. Add cleanup logic
49. Write uninstall command tests

### Phase 10 (5 tasks)
50. Write integration tests
51. Write cross-platform tests
52. Write performance tests
53. Achieve 100% code coverage
54. Fix all failing tests

### Phase 11 (6 tasks)
55. Update README.md
56. Write CLI reference docs
57. Write migration guide
58. Update CHANGELOG.md
59. Create release notes
60. Publish v2.0.0

## Tips

1. **Create in order** - Follow the phase sequence for proper dependencies
2. **Reference the detail file** - Always point to `bead-tasks-cli-enhancement.md` for full details
3. **Track progress** - Use `bd ready` to see available work
4. **Update status** - Use `bd update <id> --status in_progress` when starting work
5. **Close tasks** - Use `bd close <id>` when complete

## Verification

After creating all tasks:

```bash
# List all tasks
bd list --parent <EPIC_ID>

# Check epic status
bd show <EPIC_ID>

# Find ready tasks
bd ready
```


