import { UrlReferenceMapper } from '../UrlReferenceMapper';
import { UrlMapping } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

describe('UrlReferenceMapper', () => {
  let testMappings: UrlMapping[];
  let tempDir: string;

  beforeEach(() => {
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

    // Create a temporary directory for file-based tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'url-ref-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should create instance with inline mappings', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
    });

    it('should create instance with empty mappings', () => {
      const mapper = new UrlReferenceMapper();
      expect(mapper.getAllMappings()).toHaveLength(0);
    });

    it('should load mappings from JSON file', () => {
      const configPath = path.join(tempDir, 'test-config.json');
      fs.writeFileSync(configPath, JSON.stringify(testMappings, null, 2));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBe('https://example.com/post-1/');
    });

    it('should load mappings from YAML file', () => {
      const configPath = path.join(tempDir, 'test-config.yaml');
      fs.writeFileSync(configPath, yaml.dump(testMappings));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBe('https://example.com/post-1/');
    });

    it('should throw error if config file not found', () => {
      const configPath = path.join(tempDir, 'non-existent.json');
      expect(() => new UrlReferenceMapper({ configPath })).toThrow('Configuration file not found');
    });

    it('should throw error for unsupported file format', () => {
      const configPath = path.join(tempDir, 'test-config.txt');
      fs.writeFileSync(configPath, 'invalid content');
      expect(() => new UrlReferenceMapper({ configPath })).toThrow('Unsupported file format');
    });

    it('should validate on load by default', () => {
      const invalidMappings = [
        { title: '', url: 'invalid-url', localPath: '/path' } as UrlMapping,
      ];
      expect(() => new UrlReferenceMapper({ mappings: invalidMappings })).toThrow('Validation failed on load');
    });

    it('should skip validation when validateOnLoad is false', () => {
      const invalidMappings = [
        { title: '', url: 'invalid-url', localPath: '/path' } as UrlMapping,
      ];
      expect(() => new UrlReferenceMapper({ mappings: invalidMappings, validateOnLoad: false })).not.toThrow();
    });
  });

  describe('getUrlFromLocalPath', () => {
    it('should return URL for existing local path', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const url = mapper.getUrlFromLocalPath('/path/to/post-1.html');
      expect(url).toBe('https://example.com/post-1/');
    });

    it('should return null for non-existing local path', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const url = mapper.getUrlFromLocalPath('/path/to/non-existing.html');
      expect(url).toBeNull();
    });

    it('should handle normalized paths correctly', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      // Test with different path separators (normalized internally)
      const url = mapper.getUrlFromLocalPath(path.normalize('/path/to/post-1.html'));
      expect(url).toBe('https://example.com/post-1/');
    });
  });

  describe('getLocalPathFromUrl', () => {
    it('should return local path for existing URL', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const localPath = mapper.getLocalPathFromUrl('https://example.com/post-1/');
      expect(localPath).toBe('/path/to/post-1.html');
    });

    it('should return null for non-existing URL', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const localPath = mapper.getLocalPathFromUrl('https://example.com/non-existing/');
      expect(localPath).toBeNull();
    });
  });

  describe('addMapping', () => {
    it('should add new mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const newMapping: UrlMapping = {
        title: 'Test Post 3',
        url: 'https://example.com/post-3/',
        localPath: '/path/to/post-3.html',
      };

      mapper.addMapping(newMapping);
      expect(mapper.getAllMappings()).toHaveLength(3);
    });

    it('should throw error for duplicate URL', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const duplicateMapping: UrlMapping = {
        title: 'Duplicate',
        url: 'https://example.com/post-1/',
        localPath: '/path/to/different.html',
      };

      expect(() => mapper.addMapping(duplicateMapping)).toThrow('URL already exists');
    });

    it('should throw error for duplicate local path', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const duplicateMapping: UrlMapping = {
        title: 'Duplicate',
        url: 'https://example.com/different/',
        localPath: '/path/to/post-1.html',
      };

      expect(() => mapper.addMapping(duplicateMapping)).toThrow('Local path already exists');
    });

    it('should add timestamp if not provided', () => {
      const mapper = new UrlReferenceMapper({ mappings: [] });
      const newMapping: UrlMapping = {
        title: 'Test',
        url: 'https://example.com/test/',
        localPath: '/path/to/test.html',
      };

      mapper.addMapping(newMapping);
      const added = mapper.getAllMappings()[0];
      expect(added.lastUpdated).toBeDefined();
    });

    it('should allow duplicates when allowDuplicates is true', () => {
      const mapper = new UrlReferenceMapper({
        mappings: testMappings,
        validateOnLoad: false,
        allowDuplicates: true
      });
      const duplicateMapping: UrlMapping = {
        title: 'Duplicate',
        url: 'https://example.com/post-1/',
        localPath: '/path/to/post-1.html',
      };

      expect(() => mapper.addMapping(duplicateMapping)).not.toThrow();
      expect(mapper.getAllMappings()).toHaveLength(3);
    });
  });

  describe('updateMapping', () => {
    it('should update existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      mapper.updateMapping('https://example.com/post-1/', { title: 'Updated Title' });

      const updated = mapper.getAllMappings().find(m => m.url === 'https://example.com/post-1/');
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.lastUpdated).toBeDefined();
    });

    it('should update local path and rebuild indexes', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      mapper.updateMapping('https://example.com/post-1/', { localPath: '/new/path/post-1.html' });

      expect(mapper.getLocalPathFromUrl('https://example.com/post-1/')).toBe('/new/path/post-1.html');
      expect(mapper.getUrlFromLocalPath('/new/path/post-1.html')).toBe('https://example.com/post-1/');
      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBeNull();
    });

    it('should throw error for non-existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      expect(() => mapper.updateMapping('https://example.com/non-existing/', { title: 'New' }))
        .toThrow('Mapping not found for URL');
    });
  });

  describe('removeMapping', () => {
    it('should remove existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      const removed = mapper.removeMapping('https://example.com/post-1/');
      expect(removed).toBe(true);
      expect(mapper.getAllMappings()).toHaveLength(1);
    });

    it('should return false for non-existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      const removed = mapper.removeMapping('https://example.com/non-existing/');
      expect(removed).toBe(false);
      expect(mapper.getAllMappings()).toHaveLength(2);
    });

    it('should remove from indexes', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      mapper.removeMapping('https://example.com/post-1/');

      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBeNull();
      expect(mapper.getLocalPathFromUrl('https://example.com/post-1/')).toBeNull();
    });
  });

  describe('save', () => {
    it('should save mappings to JSON file', () => {
      const configPath = path.join(tempDir, 'output.json');
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });

      mapper.save(configPath);

      expect(fs.existsSync(configPath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(content).toHaveLength(2);
      expect(content[0].title).toBe('Test Post 1');
    });

    it('should save mappings to YAML file', () => {
      const configPath = path.join(tempDir, 'output.yaml');
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });

      mapper.save(configPath);

      expect(fs.existsSync(configPath)).toBe(true);
      const content = yaml.load(fs.readFileSync(configPath, 'utf-8')) as UrlMapping[];
      expect(content).toHaveLength(2);
      expect(content[0].title).toBe('Test Post 1');
    });

    it('should throw error if no file path specified', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      expect(() => mapper.save()).toThrow('No file path specified for saving');
    });

    it('should auto-save when autoSave is enabled', () => {
      const configPath = path.join(tempDir, 'auto-save.json');
      fs.writeFileSync(configPath, JSON.stringify(testMappings, null, 2));

      const mapper = new UrlReferenceMapper({ configPath, autoSave: true, validateOnLoad: false });

      const newMapping: UrlMapping = {
        title: 'Auto Save Test',
        url: 'https://example.com/auto-save/',
        localPath: '/path/to/auto-save.html',
      };

      mapper.addMapping(newMapping);

      const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(content).toHaveLength(3);
    });
  });

  describe('validate', () => {
    it('should validate correct mappings', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const result = mapper.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidMappings = [
        { title: '', url: 'https://example.com/', localPath: '/path' } as UrlMapping,
      ];
      const mapper = new UrlReferenceMapper({
        mappings: invalidMappings,
        validateOnLoad: false
      });
      const result = mapper.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid URL format', () => {
      const invalidMappings = [
        { title: 'Test', url: 'not-a-url', localPath: '/path' } as UrlMapping,
      ];
      const mapper = new UrlReferenceMapper({
        mappings: invalidMappings,
        validateOnLoad: false
      });
      const result = mapper.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'invalid_url')).toBe(true);
    });

    it('should detect duplicate URLs', () => {
      const duplicateMappings = [
        { title: 'Test 1', url: 'https://example.com/same/', localPath: '/path1' },
        { title: 'Test 2', url: 'https://example.com/same/', localPath: '/path2' },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: duplicateMappings,
        validateOnLoad: false
      });
      const result = mapper.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'duplicate_url')).toBe(true);
    });

    it('should detect duplicate paths', () => {
      const duplicateMappings = [
        { title: 'Test 1', url: 'https://example.com/url1/', localPath: '/same/path' },
        { title: 'Test 2', url: 'https://example.com/url2/', localPath: '/same/path' },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: duplicateMappings,
        validateOnLoad: false
      });
      const result = mapper.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'duplicate_path')).toBe(true);
    });

    it('should warn about relative paths', () => {
      const relativeMappings = [
        { title: 'Test', url: 'https://example.com/test/', localPath: 'relative/path.html' },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: relativeMappings,
        validateOnLoad: false
      });
      const result = mapper.validate();
      expect(result.warnings.some((w) => w.type === 'relative_path')).toBe(true);
    });
  });

  describe('export', () => {
    it('should export to JSON format', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const json = mapper.export('json');
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('Test Post 1');
    });

    it('should export to YAML format', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const yamlOutput = mapper.export('yaml');
      expect(() => yaml.load(yamlOutput)).not.toThrow();
      const parsed = yaml.load(yamlOutput) as UrlMapping[];
      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('Test Post 1');
    });

    it('should export to CSV format', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const csv = mapper.export('csv');
      expect(csv).toContain('Title,URL,Local Path,Last Updated');
      expect(csv).toContain('Test Post 1');
      expect(csv).toContain('https://example.com/post-1/');
      expect(csv).toContain('/path/to/post-1.html');
    });

    it('should throw error for unsupported export format', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      expect(() => mapper.export('xml' as any)).toThrow('Unsupported export format');
    });
  });

  describe('getAllMappings', () => {
    it('should return a copy of mappings array', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings, validateOnLoad: false });
      const mappings = mapper.getAllMappings();

      // Modify the returned array
      mappings.push({
        title: 'New',
        url: 'https://example.com/new/',
        localPath: '/new',
      });

      // Original should be unchanged
      expect(mapper.getAllMappings()).toHaveLength(2);
    });
  });
});

