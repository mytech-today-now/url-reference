# OpenSpec Specifications

This directory contains OpenSpec specifications for the `@mytechtoday/url-reference` package.

## Available Specifications

### url-reference-package.md

**Status:** Draft  
**Version:** 1.0.0  
**Source:** `ai-prompts/url-reference.md` (JIRA Ticket AUG-456)

Complete specification for the URL Reference npm package, including:

- **Core Library API**: `UrlReferenceMapper` class with bidirectional lookup
- **Configuration Formats**: JSON, YAML, CSV support
- **CLI Commands**: Full command-line interface (`url-ref-mapper`)
- **Augment AI Integration**: OpenSpec, beads, and Augmentcode workflows
- **Seed Data**: Initial copper mining blog mappings
- **Validation Rules**: Error and warning conditions
- **Package Structure**: File organization and dependencies
- **Acceptance Criteria**: Testable requirements

## How to Use These Specs

### For Development

1. **Read the spec** to understand requirements
2. **Reference during implementation** to ensure completeness
3. **Update as needed** when requirements change
4. **Use for testing** to verify acceptance criteria

### For AI Assistants

These specs provide structured context for:
- Code generation
- Test creation
- Documentation writing
- API design validation

### For Documentation

Specs serve as the source of truth for:
- README.md content
- API documentation
- Usage examples
- Integration guides

## Related Files

- **OpenAPI Spec**: `openapi-spec.yaml` - HTTP API documentation
- **Source Requirements**: `ai-prompts/url-reference.md` - Original JIRA ticket
- **Package Config**: `package.json` - npm package configuration
- **TypeScript Config**: `tsconfig.json` - Compiler settings

## Workflow

This project uses the **spec-driven** schema:

```
proposal.md → specs/*.md → design.md → tasks.md → implementation
```

Current status: **Specification phase**

## Next Steps

1. Create `design.md` with technical architecture decisions
2. Create `tasks.md` with implementation checklist
3. Begin implementation following the spec
4. Validate against acceptance criteria

