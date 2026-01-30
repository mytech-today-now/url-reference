import {
  convertLocalLinksToPublished,
  convertPublishedLinksToLocal,
  batchConvertPathsToUrls,
  batchConvertUrlsToPaths,
} from '../helpers';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Helper Functions', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    // Create a temporary directory for test config
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'url-ref-helpers-test-'));
    configPath = path.join(tempDir, 'test-config.json');

    // Create test configuration
    const testMappings = [
      {
        title: 'Test Post 1',
        url: 'https://example.com/post-1/',
        localPath: 'G:\\blogs\\post-1.html',
      },
      {
        title: 'Test Post 2',
        url: 'https://example.com/post-2/',
        localPath: 'G:\\blogs\\post-2.html',
      },
      {
        title: 'Unix Path Test',
        url: 'https://example.com/unix-post/',
        localPath: '/home/user/blogs/unix-post.html',
      },
    ];

    fs.writeFileSync(configPath, JSON.stringify(testMappings, null, 2));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('convertLocalLinksToPublished', () => {
    it('should convert Windows local paths to published URLs', () => {
      const content = 'Check out this post at G:\\blogs\\post-1.html for more info';
      const result = convertLocalLinksToPublished(content, configPath);
      expect(result).toBe('Check out this post at https://example.com/post-1/ for more info');
    });

    it('should convert Unix local paths to published URLs', () => {
      const content = 'See /home/user/blogs/unix-post.html for details';
      const result = convertLocalLinksToPublished(content, configPath);
      expect(result).toBe('See https://example.com/unix-post/ for details');
    });

    it('should convert multiple paths in the same content', () => {
      const content =
        'Read G:\\blogs\\post-1.html and G:\\blogs\\post-2.html for more information';
      const result = convertLocalLinksToPublished(content, configPath);
      expect(result).toBe(
        'Read https://example.com/post-1/ and https://example.com/post-2/ for more information'
      );
    });

    it('should leave unmapped paths unchanged', () => {
      const content = 'Check G:\\blogs\\unmapped.html for info';
      const result = convertLocalLinksToPublished(content, configPath);
      expect(result).toBe('Check G:\\blogs\\unmapped.html for info');
    });

    it('should handle content with no paths', () => {
      const content = 'This is just plain text with no paths';
      const result = convertLocalLinksToPublished(content, configPath);
      expect(result).toBe('This is just plain text with no paths');
    });

    it('should work with custom path pattern', () => {
      const content = 'Custom path: CUSTOM:\\path\\file.html';
      const customPattern = /CUSTOM:\\[^\s"'<>|?*]+\.html/gi;
      const result = convertLocalLinksToPublished(content, configPath, customPattern);
      // Should not match since it's not in our mappings
      expect(result).toBe('Custom path: CUSTOM:\\path\\file.html');
    });
  });

  describe('convertPublishedLinksToLocal', () => {
    it('should convert published URLs to local paths', () => {
      const content = 'Visit https://example.com/post-1/ for more info';
      const result = convertPublishedLinksToLocal(content, configPath);
      expect(result).toBe('Visit G:\\blogs\\post-1.html for more info');
    });

    it('should convert multiple URLs in the same content', () => {
      const content =
        'Check https://example.com/post-1/ and https://example.com/post-2/ for details';
      const result = convertPublishedLinksToLocal(content, configPath);
      expect(result).toBe('Check G:\\blogs\\post-1.html and G:\\blogs\\post-2.html for details');
    });

    it('should leave unmapped URLs unchanged', () => {
      const content = 'Visit https://example.com/unmapped/ for info';
      const result = convertPublishedLinksToLocal(content, configPath);
      expect(result).toBe('Visit https://example.com/unmapped/ for info');
    });

    it('should handle content with no URLs', () => {
      const content = 'This is just plain text with no URLs';
      const result = convertPublishedLinksToLocal(content, configPath);
      expect(result).toBe('This is just plain text with no URLs');
    });
  });

  describe('batchConvertPathsToUrls', () => {
    it('should convert array of paths to URLs', () => {
      const paths = ['G:\\blogs\\post-1.html', 'G:\\blogs\\post-2.html'];
      const result = batchConvertPathsToUrls(paths, configPath);

      expect(result).toEqual([
        { path: 'G:\\blogs\\post-1.html', url: 'https://example.com/post-1/' },
        { path: 'G:\\blogs\\post-2.html', url: 'https://example.com/post-2/' },
      ]);
    });

    it('should return null for unmapped paths', () => {
      const paths = ['G:\\blogs\\post-1.html', 'G:\\blogs\\unmapped.html'];
      const result = batchConvertPathsToUrls(paths, configPath);

      expect(result).toEqual([
        { path: 'G:\\blogs\\post-1.html', url: 'https://example.com/post-1/' },
        { path: 'G:\\blogs\\unmapped.html', url: null },
      ]);
    });

    it('should handle empty array', () => {
      const result = batchConvertPathsToUrls([], configPath);
      expect(result).toEqual([]);
    });
  });

  describe('batchConvertUrlsToPaths', () => {
    it('should convert array of URLs to paths', () => {
      const urls = ['https://example.com/post-1/', 'https://example.com/post-2/'];
      const result = batchConvertUrlsToPaths(urls, configPath);

      expect(result).toEqual([
        { url: 'https://example.com/post-1/', path: 'G:\\blogs\\post-1.html' },
        { url: 'https://example.com/post-2/', path: 'G:\\blogs\\post-2.html' },
      ]);
    });

    it('should return null for unmapped URLs', () => {
      const urls = ['https://example.com/post-1/', 'https://example.com/unmapped/'];
      const result = batchConvertUrlsToPaths(urls, configPath);

      expect(result).toEqual([
        { url: 'https://example.com/post-1/', path: 'G:\\blogs\\post-1.html' },
        { url: 'https://example.com/unmapped/', path: null },
      ]);
    });

    it('should handle empty array', () => {
      const result = batchConvertUrlsToPaths([], configPath);
      expect(result).toEqual([]);
    });
  });
});

