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
      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBe(
        'https://example.com/post-1/'
      );
    });

    it('should load mappings from YAML file', () => {
      const configPath = path.join(tempDir, 'test-config.yaml');
      fs.writeFileSync(configPath, yaml.dump(testMappings));

      const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });
      expect(mapper.getAllMappings()).toHaveLength(2);
      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBe(
        'https://example.com/post-1/'
      );
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
      const invalidMappings = [{ title: '', url: 'invalid-url', localPath: '/path' } as UrlMapping];
      expect(() => new UrlReferenceMapper({ mappings: invalidMappings })).toThrow(
        'Validation failed on load'
      );
    });

    it('should skip validation when validateOnLoad is false', () => {
      const invalidMappings = [{ title: '', url: 'invalid-url', localPath: '/path' } as UrlMapping];
      expect(
        () => new UrlReferenceMapper({ mappings: invalidMappings, validateOnLoad: false })
      ).not.toThrow();
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
        allowDuplicates: true,
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

      const updated = mapper.getAllMappings().find((m) => m.url === 'https://example.com/post-1/');
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.lastUpdated).toBeDefined();
    });

    it('should update local path and rebuild indexes', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      mapper.updateMapping('https://example.com/post-1/', { localPath: '/new/path/post-1.html' });

      expect(mapper.getLocalPathFromUrl('https://example.com/post-1/')).toBe(
        '/new/path/post-1.html'
      );
      expect(mapper.getUrlFromLocalPath('/new/path/post-1.html')).toBe(
        'https://example.com/post-1/'
      );
      expect(mapper.getUrlFromLocalPath('/path/to/post-1.html')).toBeNull();
    });

    it('should throw error for non-existing mapping', () => {
      const mapper = new UrlReferenceMapper({ mappings: [...testMappings], validateOnLoad: false });
      expect(() =>
        mapper.updateMapping('https://example.com/non-existing/', { title: 'New' })
      ).toThrow('Mapping not found for URL');
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
        validateOnLoad: false,
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
        validateOnLoad: false,
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
        validateOnLoad: false,
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
        validateOnLoad: false,
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
        validateOnLoad: false,
      });
      const result = mapper.validate();
      expect(result.warnings.some((w) => w.type === 'relative_path')).toBe(true);
    });

    it('should warn about missing files', () => {
      const missingFileMappings = [
        {
          title: 'Test',
          url: 'https://example.com/test/',
          localPath: '/path/to/non-existent-file.html',
        },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: missingFileMappings,
        validateOnLoad: false,
      });
      const result = mapper.validate();
      expect(result.warnings.some((w) => w.type === 'missing_file')).toBe(true);
    });

    it('should warn about missing metadata', () => {
      const noMetadataMappings = [
        {
          title: 'Test',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
          // No metadata field
        },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: noMetadataMappings,
        validateOnLoad: false,
      });
      const result = mapper.validate();
      expect(result.warnings.some((w) => w.type === 'missing_metadata')).toBe(true);
    });

    it('should warn about outdated timestamps', () => {
      // Create a date more than 90 days old
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      const outdatedMappings = [
        {
          title: 'Test',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
          lastUpdated: oldDate.toISOString(),
        },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: outdatedMappings,
        validateOnLoad: false,
      });
      const result = mapper.validate();
      expect(result.warnings.some((w) => w.type === 'outdated_timestamp')).toBe(true);
    });

    it('should not warn about recent timestamps', () => {
      // Create a recent date (within 90 days)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);

      const recentMappings = [
        {
          title: 'Test',
          url: 'https://example.com/test/',
          localPath: '/path/to/test.html',
          lastUpdated: recentDate.toISOString(),
        },
      ];
      const mapper = new UrlReferenceMapper({
        mappings: recentMappings,
        validateOnLoad: false,
      });
      const result = mapper.validate();
      expect(result.warnings.some((w) => w.type === 'outdated_timestamp')).toBe(false);
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

  describe('Metadata Extraction Integration', () => {
    it('should extract metadata from Markdown file', async () => {
      const content = `---
author: John Doe
tags: typescript, testing
---

# Test Document

This is a test document with enough content to create a meaningful summary. It contains multiple paragraphs and various elements to test the extraction functionality.

> This is an important quote.

Check out [this link](https://example.com/page).

![Image](https://example.com/image.jpg)`;

      const filePath = path.join(tempDir, 'test.md');
      fs.writeFileSync(filePath, content);

      const mapper = new UrlReferenceMapper();
      const metadata = await mapper.extractMetadataFromFile(filePath);

      expect(metadata.author).toBe('John Doe');
      expect(metadata.tags).toBe('typescript, testing');
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.readingTime).toBeGreaterThan(0);
      expect(metadata.quotes).toBeDefined();
      expect(metadata.quotes!.length).toBeGreaterThan(0);
      expect(metadata.featuredImages).toBeDefined();
      expect(metadata.summary).toBeDefined();
    });

    it('should extract metadata from HTML file', async () => {
      const content = `<!DOCTYPE html>
<html>
<head>
  <meta name="author" content="Jane Smith">
  <meta name="description" content="Test description">
  <meta name="keywords" content="html, testing">
</head>
<body>
  <h1>Test Article</h1>
  <p>This is a test article with enough content to create a meaningful TLDR summary. It needs to be at least 200 characters long to be considered valid. This paragraph continues with more information about the topic being discussed.</p>
  <blockquote>Important quote here</blockquote>
  <a href="https://example.com/page">Link</a>
  <img src="https://example.com/image.jpg" alt="Test">
</body>
</html>`;

      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, content);

      const mapper = new UrlReferenceMapper();
      const metadata = await mapper.extractMetadataFromFile(filePath);

      expect(metadata.author).toBe('Jane Smith');
      expect(metadata.summary).toBe('Test description');
      expect(metadata.tags).toBe('html, testing');
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.quotes).toBeDefined();
      expect(metadata.featuredImages).toBeDefined();
    });

    it('should extract metadata from plain text file', async () => {
      const content = `This is a plain text document with enough content to test extraction.

This is the first meaningful paragraph that should be extracted as a summary. It contains enough text to be considered valid and useful for readers who want a quick overview.

This is a second paragraph that adds more context and details. It helps to reach the minimum character count for a proper TLDR summary that provides value to readers.

Check out https://example.com/page for more info.`;

      const filePath = path.join(tempDir, 'test.txt');
      fs.writeFileSync(filePath, content);

      const mapper = new UrlReferenceMapper();
      const metadata = await mapper.extractMetadataFromFile(filePath);

      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.readingTime).toBeGreaterThan(0);
      expect(metadata.summary).toBeDefined();
      expect(metadata.tldr).toBeDefined();
    });

    it('should add mapping with automatic metadata extraction', async () => {
      const content = `---
author: Test Author
tags: test, integration
---

# Integration Test

This is a test document for integration testing. It has enough content to extract meaningful metadata including word count, reading time, and summary information.

> A notable quote from the document.`;

      const filePath = path.join(tempDir, 'integration.md');
      fs.writeFileSync(filePath, content);

      const mapper = new UrlReferenceMapper();
      await mapper.addMappingWithExtraction(
        'https://example.com/integration/',
        filePath,
        'Integration Test'
      );

      const mapping = mapper.getMapping('https://example.com/integration/');
      expect(mapping).toBeDefined();
      expect(mapping!.title).toBe('Integration Test');
      expect(mapping!.author).toBe('Test Author');
      expect(mapping!.tags).toBe('test, integration');
      expect(mapping!.wordCount).toBeGreaterThan(0);
      expect(mapping!.readingTime).toBeGreaterThan(0);
      expect(mapping!.quotes).toBeDefined();
    });

    it('should update mapping with fresh metadata extraction', async () => {
      const content1 = `# Original Content

This is the original content with some text.`;

      const filePath = path.join(tempDir, 'update-test.md');
      fs.writeFileSync(filePath, content1);

      const mapper = new UrlReferenceMapper();
      await mapper.addMappingWithExtraction(
        'https://example.com/update-test/',
        filePath,
        'Update Test'
      );

      const originalMapping = mapper.getMapping('https://example.com/update-test/');
      const originalWordCount = originalMapping!.wordCount;

      // Update the file with more content
      const content2 = `# Updated Content

This is the updated content with much more text to increase the word count significantly. We add multiple paragraphs to ensure the word count changes.

This is another paragraph with additional content.`;

      fs.writeFileSync(filePath, content2);

      // Update the mapping with fresh extraction
      await mapper.updateMappingWithExtraction('https://example.com/update-test/');

      const updatedMapping = mapper.getMapping('https://example.com/update-test/');
      expect(updatedMapping!.wordCount).toBeGreaterThan(originalWordCount!);
    });

    it('should handle extraction with custom configuration', async () => {
      const content = Array.from({ length: 500 }, () => 'word').join(' ');
      const filePath = path.join(tempDir, 'custom-config.md');
      fs.writeFileSync(filePath, content);

      const mapper = new UrlReferenceMapper();
      const metadata = await mapper.extractMetadataFromFile(filePath, {
        readingSpeed: 200,
      });

      expect(metadata.readingTime).toBe(Math.ceil(500 / 200));
    });

    it('should handle extraction errors gracefully', async () => {
      const mapper = new UrlReferenceMapper();

      await expect(
        mapper.extractMetadataFromFile('/non/existent/file.md')
      ).rejects.toThrow('File not found');
    });
  });
});
