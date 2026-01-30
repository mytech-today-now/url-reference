import { UrlReferenceMapper } from '../UrlReferenceMapper';
import { UrlMapping } from '../types';

describe('UrlReferenceMapper', () => {
  let testMappings: UrlMapping[];

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
  });

  describe('constructor', () => {
    it('should create instance with inline mappings', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      expect(mapper.getAllMappings()).toHaveLength(2);
    });

    it('should create instance with empty mappings', () => {
      const mapper = new UrlReferenceMapper();
      expect(mapper.getAllMappings()).toHaveLength(0);
    });
  });

  describe('getUrlFromLocalPath', () => {
    it('should return URL for existing local path', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const url = mapper.getUrlFromLocalPath('/path/to/post-1.html');
      expect(url).toBe('https://example.com/post-1/');
    });

    it('should return null for non-existing local path', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const url = mapper.getUrlFromLocalPath('/path/to/non-existing.html');
      expect(url).toBeNull();
    });
  });

  describe('getLocalPathFromUrl', () => {
    it('should return local path for existing URL', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const path = mapper.getLocalPathFromUrl('https://example.com/post-1/');
      expect(path).toBe('/path/to/post-1.html');
    });

    it('should return null for non-existing URL', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const path = mapper.getLocalPathFromUrl('https://example.com/non-existing/');
      expect(path).toBeNull();
    });
  });

  describe('addMapping', () => {
    it('should add new mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const newMapping: UrlMapping = {
        title: 'Test Post 3',
        url: 'https://example.com/post-3/',
        localPath: '/path/to/post-3.html',
      };

      mapper.addMapping(newMapping);
      expect(mapper.getAllMappings()).toHaveLength(3);
    });

    it('should throw error for duplicate URL', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const duplicateMapping: UrlMapping = {
        title: 'Duplicate',
        url: 'https://example.com/post-1/',
        localPath: '/path/to/different.html',
      };

      expect(() => mapper.addMapping(duplicateMapping)).toThrow('URL already exists');
    });

    it('should throw error for duplicate local path', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
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
  });

  describe('removeMapping', () => {
    it('should remove existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings] });
      const removed = mapper.removeMapping('https://example.com/post-1/');
      expect(removed).toBe(true);
      expect(mapper.getAllMappings()).toHaveLength(1);
    });

    it('should return false for non-existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings] });
      const removed = mapper.removeMapping('https://example.com/non-existing/');
      expect(removed).toBe(false);
      expect(mapper.getAllMappings()).toHaveLength(2);
    });
  });

  describe('validate', () => {
    it('should validate correct mappings', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
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
  });

  describe('export', () => {
    it('should export to JSON format', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const json = mapper.export('json');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should export to CSV format', () => {
      const mapper = new UrlReferenceMapper({ mappings: testMappings });
      const csv = mapper.export('csv');
      expect(csv).toContain('Title,URL,Local Path,Last Updated');
      expect(csv).toContain('Test Post 1');
    });
  });
});

