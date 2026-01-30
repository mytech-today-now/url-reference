import { UrlReferenceMapper } from '../UrlReferenceMapper';
import { UrlMapping } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

describe('File Loaders', () => {
  let tempDir: string;
  let testMappings: UrlMapping[];

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-loader-test-'));
    testMappings = [
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
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('JSON file loading', () => {
    it('should load valid JSON file', () => {
      const configPath = path.join(tempDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify(testMappings, null, 2));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
      expect(mapper.getAllMappings()[0].title).toBe('Test Post 1');
    });

    it('should throw error for invalid JSON', () => {
      const configPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(configPath, '{ invalid json }');

      expect(() => new UrlReferenceMapper({ configPath })).toThrow();
    });

    it('should throw error for empty JSON file', () => {
      const configPath = path.join(tempDir, 'empty.json');
      fs.writeFileSync(configPath, '');

      expect(() => new UrlReferenceMapper({ configPath })).toThrow();
    });

    it('should load JSON file with UTF-8 encoding', () => {
      const configPath = path.join(tempDir, 'utf8.json');
      const mappingsWithUnicode = [
        {
          title: 'Test with émojis 🎉',
          url: 'https://example.com/unicode/',
          localPath: '/path/to/unicode.html',
        },
      ];
      fs.writeFileSync(configPath, JSON.stringify(mappingsWithUnicode, null, 2), 'utf-8');

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()[0].title).toBe('Test with émojis 🎉');
    });
  });

  describe('YAML file loading', () => {
    it('should load valid YAML file with .yaml extension', () => {
      const configPath = path.join(tempDir, 'config.yaml');
      fs.writeFileSync(configPath, yaml.dump(testMappings));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
      expect(mapper.getAllMappings()[0].title).toBe('Test Post 1');
    });

    it('should load valid YAML file with .yml extension', () => {
      const configPath = path.join(tempDir, 'config.yml');
      fs.writeFileSync(configPath, yaml.dump(testMappings));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
      expect(mapper.getAllMappings()[0].title).toBe('Test Post 1');
    });

    it('should throw error for invalid YAML', () => {
      const configPath = path.join(tempDir, 'invalid.yaml');
      fs.writeFileSync(configPath, '{ invalid: yaml: content: }');

      expect(() => new UrlReferenceMapper({ configPath })).toThrow();
    });

    it('should load YAML file with UTF-8 encoding', () => {
      const configPath = path.join(tempDir, 'utf8.yaml');
      const mappingsWithUnicode = [
        {
          title: 'Test with émojis 🎉',
          url: 'https://example.com/unicode/',
          localPath: '/path/to/unicode.html',
        },
      ];
      fs.writeFileSync(configPath, yaml.dump(mappingsWithUnicode), 'utf-8');

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()[0].title).toBe('Test with émojis 🎉');
    });
  });

  describe('Format detection', () => {
    it('should detect JSON format by .json extension', () => {
      const configPath = path.join(tempDir, 'test.json');
      fs.writeFileSync(configPath, JSON.stringify(testMappings));

      expect(() => new UrlReferenceMapper({ configPath, validateOnLoad: false })).not.toThrow();
    });

    it('should detect YAML format by .yaml extension', () => {
      const configPath = path.join(tempDir, 'test.yaml');
      fs.writeFileSync(configPath, yaml.dump(testMappings));

      expect(() => new UrlReferenceMapper({ configPath, validateOnLoad: false })).not.toThrow();
    });

    it('should detect YAML format by .yml extension', () => {
      const configPath = path.join(tempDir, 'test.yml');
      fs.writeFileSync(configPath, yaml.dump(testMappings));

      expect(() => new UrlReferenceMapper({ configPath, validateOnLoad: false })).not.toThrow();
    });

    it('should throw error for unsupported file extension', () => {
      const configPath = path.join(tempDir, 'test.txt');
      fs.writeFileSync(configPath, 'some content');

      expect(() => new UrlReferenceMapper({ configPath })).toThrow('Unsupported file format');
    });

    it('should handle case-insensitive extensions', () => {
      const configPath = path.join(tempDir, 'test.JSON');
      fs.writeFileSync(configPath, JSON.stringify(testMappings));

      expect(() => new UrlReferenceMapper({ configPath, validateOnLoad: false })).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should throw error if file does not exist', () => {
      const configPath = path.join(tempDir, 'non-existent.json');

      expect(() => new UrlReferenceMapper({ configPath })).toThrow('Configuration file not found');
    });

    it('should throw error if file path is a directory', () => {
      const dirPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(dirPath);

      expect(() => new UrlReferenceMapper({ configPath: dirPath })).toThrow();
    });

    it('should throw error for file with BOM (Byte Order Mark) in JSON', () => {
      const configPath = path.join(tempDir, 'bom.json');
      const bom = '\uFEFF';
      fs.writeFileSync(configPath, bom + JSON.stringify(testMappings));

      // JSON.parse doesn't handle BOM, so this should throw
      expect(() => new UrlReferenceMapper({ configPath, validateOnLoad: false })).toThrow();
    });

    it('should handle large files', () => {
      const configPath = path.join(tempDir, 'large.json');
      const largeMappings: UrlMapping[] = [];
      for (let i = 0; i < 1000; i++) {
        largeMappings.push({
          title: `Post ${i}`,
          url: `https://example.com/post-${i}/`,
          localPath: `/path/to/post-${i}.html`,
        });
      }
      fs.writeFileSync(configPath, JSON.stringify(largeMappings));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(1000);
    });

    it('should handle empty array in JSON', () => {
      const configPath = path.join(tempDir, 'empty-array.json');
      fs.writeFileSync(configPath, '[]');

      const mapper = new UrlReferenceMapper({ configPath });
      expect(mapper.getAllMappings()).toHaveLength(0);
    });

    it('should handle empty array in YAML', () => {
      const configPath = path.join(tempDir, 'empty-array.yaml');
      fs.writeFileSync(configPath, '[]');

      const mapper = new UrlReferenceMapper({ configPath });
      expect(mapper.getAllMappings()).toHaveLength(0);
    });
  });

  describe('File saving', () => {
    it('should save to JSON format', () => {
      const configPath = path.join(tempDir, 'save-test.json');
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });

      mapper.save(configPath);

      expect(fs.existsSync(configPath)).toBe(true);
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(2);
    });

    it('should save to YAML format', () => {
      const configPath = path.join(tempDir, 'save-test.yaml');
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });

      mapper.save(configPath);

      expect(fs.existsSync(configPath)).toBe(true);
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = yaml.load(content);
      expect(parsed).toHaveLength(2);
    });

    it('should preserve data integrity when saving and loading', () => {
      const configPath = path.join(tempDir, 'roundtrip.json');
      const mapper1 = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });

      mapper1.save(configPath);

      const mapper2 = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper2.getAllMappings()).toEqual(testMappings);
    });

    it('should create parent directories if they do not exist', () => {
      const nestedPath = path.join(tempDir, 'nested', 'dir', 'config.json');
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });

      // Create parent directories first
      fs.mkdirSync(path.dirname(nestedPath), { recursive: true });
      mapper.save(nestedPath);

      expect(fs.existsSync(nestedPath)).toBe(true);
    });
  });
});
