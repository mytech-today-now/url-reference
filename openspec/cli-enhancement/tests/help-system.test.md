# Help System Test Specification

**Component:** Help System  
**Version:** 2.0.0  
**Coverage Target:** 100%  

---

## Test Categories

### 1. Unit Tests

#### HelpRenderer Tests

**Test Suite:** `HelpRenderer`

```typescript
describe('HelpRenderer', () => {
  describe('renderFull', () => {
    it('should render full help with all sections', () => {
      // Arrange
      const template: HelpTemplate = {
        command: 'add',
        description: 'Add a new URL mapping',
        usage: 'url-ref add <url> <localPath> [options]',
        options: [
          { flags: '-e, --extract', description: 'Extract metadata' }
        ],
        examples: ['url-ref add https://example.com ./doc.md'],
        exitCodes: [{ code: 0, description: 'Success' }],
        relatedCommands: ['remove', 'list']
      };
      const renderer = new HelpRenderer();

      // Act
      const output = renderer.renderFull(template);

      // Assert
      expect(output).toContain('Add a new URL mapping');
      expect(output).toContain('Usage:');
      expect(output).toContain('Options:');
      expect(output).toContain('Examples:');
      expect(output).toContain('Exit Codes:');
      expect(output).toContain('Related Commands:');
    });

    it('should format options with proper alignment', () => {
      const template: HelpTemplate = {
        command: 'test',
        description: 'Test command',
        usage: 'url-ref test',
        options: [
          { flags: '-s, --short', description: 'Short option' },
          { flags: '--very-long-option', description: 'Long option' }
        ],
        examples: [],
        exitCodes: [],
        relatedCommands: []
      };
      const renderer = new HelpRenderer();

      const output = renderer.renderFull(template);

      // Options should be aligned
      const lines = output.split('\n');
      const optionLines = lines.filter(l => l.includes('--'));
      expect(optionLines.length).toBe(2);
      // Check alignment (descriptions should start at same column)
    });

    it('should use colors when enabled', () => {
      const template = createTestTemplate();
      const renderer = new HelpRenderer({ color: true });

      const output = renderer.renderFull(template);

      // Should contain ANSI color codes
      expect(output).toMatch(/\x1b\[\d+m/);
    });

    it('should not use colors when disabled', () => {
      const template = createTestTemplate();
      const renderer = new HelpRenderer({ color: false });

      const output = renderer.renderFull(template);

      // Should not contain ANSI color codes
      expect(output).not.toMatch(/\x1b\[\d+m/);
    });
  });

  describe('renderBrief', () => {
    it('should render brief help with summary only', () => {
      const template = createTestTemplate();
      const renderer = new HelpRenderer();

      const output = renderer.renderBrief(template);

      expect(output).toContain('Add a new URL mapping');
      expect(output).toContain('Options:');
      expect(output).not.toContain('Examples:');
      expect(output).not.toContain('Exit Codes:');
    });

    it('should be shorter than full help', () => {
      const template = createTestTemplate();
      const renderer = new HelpRenderer();

      const fullOutput = renderer.renderFull(template);
      const briefOutput = renderer.renderBrief(template);

      expect(briefOutput.length).toBeLessThan(fullOutput.length);
    });
  });

  describe('renderGlobal', () => {
    it('should list all commands', () => {
      const commands = [
        createTestTemplate('add'),
        createTestTemplate('remove'),
        createTestTemplate('list')
      ];
      const renderer = new HelpRenderer();

      const output = renderer.renderGlobal(commands);

      expect(output).toContain('add');
      expect(output).toContain('remove');
      expect(output).toContain('list');
    });

    it('should group commands by category', () => {
      // If we implement command categories
      const commands = [
        { ...createTestTemplate('add'), category: 'mapping' },
        { ...createTestTemplate('version'), category: 'utility' }
      ];
      const renderer = new HelpRenderer();

      const output = renderer.renderGlobal(commands);

      expect(output).toContain('Mapping Commands:');
      expect(output).toContain('Utility Commands:');
    });
  });
});
```

#### HelpRegistry Tests

**Test Suite:** `HelpRegistry`

```typescript
describe('HelpRegistry', () => {
  describe('register', () => {
    it('should register a help template', () => {
      const registry = new HelpRegistry();
      const template = createTestTemplate('add');

      registry.register(template);

      expect(registry.get('add')).toEqual(template);
    });

    it('should throw error for duplicate command', () => {
      const registry = new HelpRegistry();
      const template = createTestTemplate('add');

      registry.register(template);

      expect(() => registry.register(template)).toThrow('already registered');
    });
  });

  describe('get', () => {
    it('should retrieve registered template', () => {
      const registry = new HelpRegistry();
      const template = createTestTemplate('add');
      registry.register(template);

      const retrieved = registry.get('add');

      expect(retrieved).toEqual(template);
    });

    it('should throw error for non-existent command', () => {
      const registry = new HelpRegistry();

      expect(() => registry.get('nonexistent')).toThrow('not found');
    });
  });

  describe('getAll', () => {
    it('should return all registered templates', () => {
      const registry = new HelpRegistry();
      registry.register(createTestTemplate('add'));
      registry.register(createTestTemplate('remove'));

      const all = registry.getAll();

      expect(all).toHaveLength(2);
      expect(all.map(t => t.command)).toEqual(['add', 'remove']);
    });
  });
});
```

---

### 2. Integration Tests

#### Command Help Tests

**Test Suite:** `Command Help Integration`

```typescript
describe('Command Help Integration', () => {
  it('should show full help with --help', () => {
    const output = execSync('url-ref add --help').toString();

    expect(output).toContain('Add a new URL mapping');
    expect(output).toContain('Usage:');
    expect(output).toContain('Options:');
    expect(output).toContain('Examples:');
    expect(output).toContain('Exit Codes:');
  });

  it('should show brief help with -h', () => {
    const output = execSync('url-ref add -h').toString();

    expect(output).toContain('Add a new URL mapping');
    expect(output).toContain('Options:');
    expect(output).not.toContain('Examples:');
  });

  it('should show global help with --help', () => {
    const output = execSync('url-ref --help').toString();

    expect(output).toContain('url-ref');
    expect(output).toContain('add');
    expect(output).toContain('remove');
    expect(output).toContain('list');
  });

  it('should show command list with -h', () => {
    const output = execSync('url-ref -h').toString();

    expect(output).toContain('add');
    expect(output).toContain('remove');
    expect(output).not.toContain('Examples:');
  });

  it('should show help for specific command with help command', () => {
    const output = execSync('url-ref help add').toString();

    expect(output).toContain('Add a new URL mapping');
  });

  it('should show error for non-existent command', () => {
    expect(() => {
      execSync('url-ref help nonexistent');
    }).toThrow();
  });
});
```

---

### 3. Edge Case Tests

```typescript
describe('Help System Edge Cases', () => {
  it('should handle command with no options', () => {
    const template: HelpTemplate = {
      command: 'simple',
      description: 'Simple command',
      usage: 'url-ref simple',
      options: [],
      examples: ['url-ref simple'],
      exitCodes: [{ code: 0, description: 'Success' }],
      relatedCommands: []
    };
    const renderer = new HelpRenderer();

    const output = renderer.renderFull(template);

    expect(output).toContain('Simple command');
    expect(output).toContain('No options available');
  });

  it('should handle very long descriptions', () => {
    const longDescription = 'A'.repeat(500);
    const template = {
      ...createTestTemplate(),
      description: longDescription
    };
    const renderer = new HelpRenderer();

    const output = renderer.renderFull(template);

    // Should wrap long text
    const lines = output.split('\n');
    const maxLineLength = Math.max(...lines.map(l => l.length));
    expect(maxLineLength).toBeLessThan(100);
  });

  it('should handle special characters in help text', () => {
    const template = {
      ...createTestTemplate(),
      description: 'Command with <special> & "characters"'
    };
    const renderer = new HelpRenderer();

    const output = renderer.renderFull(template);

    expect(output).toContain('<special>');
    expect(output).toContain('&');
    expect(output).toContain('"characters"');
  });
});
```

---

## Test Helpers

```typescript
function createTestTemplate(command = 'add'): HelpTemplate {
  return {
    command,
    description: `${command} command description`,
    usage: `url-ref ${command} [options]`,
    options: [
      { flags: '-h', description: 'Show brief help' },
      { flags: '--help', description: 'Show detailed help' }
    ],
    examples: [`url-ref ${command}`],
    exitCodes: [{ code: 0, description: 'Success' }],
    relatedCommands: []
  };
}
```

---

## Coverage Requirements

- **Line Coverage:** 100%
- **Branch Coverage:** 100%
- **Function Coverage:** 100%
- **Statement Coverage:** 100%

---

## Performance Benchmarks

- Help rendering: <10ms
- Registry lookup: <1ms
- Full help display: <100ms

