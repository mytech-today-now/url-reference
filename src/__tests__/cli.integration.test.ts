import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('CLI Integration Tests', () => {
  let tempDir: string;
  let cliPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-'));
    cliPath = path.join(__dirname, '../../dist/cli.js');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const runCli = (args: string, options: { cwd?: string; expectError?: boolean } = {}): string => {
    const cwd = options.cwd || tempDir;
    try {
      const result = execSync(`node "${cliPath}" ${args}`, {
        cwd,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } catch (error: any) {
      if (options.expectError) {
        return error.stdout || error.stderr || '';
      }
      throw error;
    }
  };

  describe('init command', () => {
    it('should create default JSON config file', () => {
      const output = runCli('init', { cwd: tempDir });
      
      expect(output).toContain('Created url-references.json');
      expect(fs.existsSync(path.join(tempDir, 'url-references.json'))).toBe(true);
      
      const content = JSON.parse(fs.readFileSync(path.join(tempDir, 'url-references.json'), 'utf-8'));
      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBeGreaterThan(0);
    });

    it('should create YAML config file when specified', () => {
      const output = runCli('init --format yaml', { cwd: tempDir });
      
      expect(output).toContain('Created url-references.yaml');
      expect(fs.existsSync(path.join(tempDir, 'url-references.yaml'))).toBe(true);
    });

    it('should create config at custom path', () => {
      const customPath = 'custom-config.json';
      const output = runCli(`init --path ${customPath}`, { cwd: tempDir });
      
      expect(output).toContain(`Created ${customPath}`);
      expect(fs.existsSync(path.join(tempDir, customPath))).toBe(true);
    });

    it('should fail if file already exists', () => {
      const configPath = path.join(tempDir, 'url-references.json');
      fs.writeFileSync(configPath, '[]');
      
      try {
        runCli('init', { cwd: tempDir });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('File already exists');
      }
    });
  });

  describe('add command', () => {
    beforeEach(() => {
      // Create initial config
      const configPath = path.join(tempDir, 'url-references.json');
      fs.writeFileSync(configPath, '[]');
    });

    it('should add a new mapping', () => {
      const output = runCli(
        'add --title "Test Post" --url "https://example.com/test/" --path "/path/to/test.html"',
        { cwd: tempDir }
      );
      
      expect(output).toContain('Added mapping: Test Post');
      
      const content = JSON.parse(fs.readFileSync(path.join(tempDir, 'url-references.json'), 'utf-8'));
      expect(content).toHaveLength(1);
      expect(content[0].title).toBe('Test Post');
      expect(content[0].url).toBe('https://example.com/test/');
    });

    it('should use custom config path', () => {
      const customConfig = path.join(tempDir, 'custom.json');
      fs.writeFileSync(customConfig, '[]');
      
      runCli(
        `add --title "Test" --url "https://example.com/test/" --path "/test.html" --config ${customConfig}`,
        { cwd: tempDir }
      );
      
      const content = JSON.parse(fs.readFileSync(customConfig, 'utf-8'));
      expect(content).toHaveLength(1);
    });

    it('should fail for duplicate URL', () => {
      runCli(
        'add --title "Test 1" --url "https://example.com/test/" --path "/path1.html"',
        { cwd: tempDir }
      );
      
      try {
        runCli(
          'add --title "Test 2" --url "https://example.com/test/" --path "/path2.html"',
          { cwd: tempDir }
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('URL already exists');
      }
    });
  });

  describe('get-url command', () => {
    beforeEach(() => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: 'Test Post',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));
    });

    it('should get URL from local path', () => {
      const output = runCli('get-url "/path/to/test.html"', { cwd: tempDir });
      expect(output.trim()).toBe('https://example.com/test/');
    });

    it('should fail for non-existing path', () => {
      try {
        runCli('get-url "/non/existing/path.html"', { cwd: tempDir });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('No URL found');
      }
    });
  });

  describe('get-path command', () => {
    beforeEach(() => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: 'Test Post',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));
    });

    it('should get local path from URL', () => {
      const output = runCli('get-path "https://example.com/test/"', { cwd: tempDir });
      expect(output.trim()).toBe('/path/to/test.html');
    });

    it('should fail for non-existing URL', () => {
      try {
        runCli('get-path "https://example.com/non-existing/"', { cwd: tempDir });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('No local path found');
      }
    });
  });

  describe('list command', () => {
    beforeEach(() => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: 'Test Post 1',
          url: 'https://example.com/post-1/',
          localPath: '/path/to/post-1.html',
          lastUpdated: '2026-01-28T00:00:00Z',
        },
        {
          title: 'Test Post 2',
          url: 'https://example.com/post-2/',
          localPath: '/path/to/post-2.html',
          lastUpdated: '2026-01-28T00:00:00Z',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));
    });

    it('should list all mappings in table format', () => {
      const output = runCli('list', { cwd: tempDir });

      expect(output).toContain('Test Post 1');
      expect(output).toContain('Test Post 2');
      expect(output).toContain('https://example.com/post-1/');
      expect(output).toContain('Total: 2 mapping(s)');
    });

    it('should list mappings in JSON format', () => {
      const output = runCli('list --format json', { cwd: tempDir });

      const parsed = JSON.parse(output);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('Test Post 1');
    });

    it('should list mappings in YAML format', () => {
      const output = runCli('list --format yaml', { cwd: tempDir });

      expect(output).toContain('title: Test Post 1');
      expect(output).toContain('url: https://example.com/post-1/');
    });

    it('should handle empty mappings', () => {
      const configPath = path.join(tempDir, 'url-references.json');
      fs.writeFileSync(configPath, '[]');

      const output = runCli('list', { cwd: tempDir });
      expect(output).toContain('No mappings found');
    });
  });

  describe('validate command', () => {
    it('should validate correct mappings', () => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: 'Test Post',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));

      const output = runCli('validate', { cwd: tempDir });
      expect(output).toContain('All mappings are valid');
    });

    it('should detect validation errors', () => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: '',
          url: 'invalid-url',
          localPath: '/path/to/test.html',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));

      try {
        runCli('validate', { cwd: tempDir });
        fail('Should have thrown an error');
      } catch (error: any) {
        // The error is thrown on load due to validateOnLoad being true by default
        // Check that validation failed
        expect(error.message).toContain('Validation failed');
      }
    });

    it('should display warnings', () => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: 'Test',
          url: 'https://example.com/test/',
          localPath: 'relative/path.html', // Relative path should trigger warning
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));

      const output = runCli('validate', { cwd: tempDir });
      expect(output).toContain('Warnings:');
      expect(output).toContain('relative_path');
    });
  });

  describe('export command', () => {
    beforeEach(() => {
      const configPath = path.join(tempDir, 'url-references.json');
      const mappings = [
        {
          title: 'Test Post',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
          lastUpdated: '2026-01-28T00:00:00Z',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappings));
    });

    it('should export to JSON format', () => {
      const output = runCli('export --format json', { cwd: tempDir });

      const parsed = JSON.parse(output);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Test Post');
    });

    it('should export to YAML format', () => {
      const output = runCli('export --format yaml', { cwd: tempDir });

      expect(output).toContain('title: Test Post');
      expect(output).toContain('url: https://example.com/test/');
    });

    it('should export to CSV format', () => {
      const output = runCli('export --format csv', { cwd: tempDir });

      expect(output).toContain('Title,URL,Local Path,Last Updated');
      expect(output).toContain('Test Post');
      expect(output).toContain('https://example.com/test/');
    });

    it('should export to file', () => {
      const outputFile = path.join(tempDir, 'export.json');
      const output = runCli(`export --format json --output ${outputFile}`, { cwd: tempDir });

      expect(output).toContain(`Exported to ${outputFile}`);
      expect(fs.existsSync(outputFile)).toBe(true);

      const content = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      expect(content).toHaveLength(1);
    });
  });
});

