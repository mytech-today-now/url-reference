/**
 * Helper functions for beads tasks and Augment AI workflows
 */

import { UrlReferenceMapper } from './UrlReferenceMapper';

/**
 * Convert local file paths in content to published URLs
 * 
 * This helper function is designed for use in beads tasks and Augment AI workflows
 * to automatically replace local filesystem paths with their corresponding published URLs.
 * 
 * @param content - The content containing local file paths to convert
 * @param configPath - Path to the URL reference configuration file
 * @param pathPattern - Optional regex pattern to match local paths (default matches common Windows paths)
 * @returns Content with local paths replaced by published URLs
 * 
 * @example
 * ```typescript
 * import { convertLocalLinksToPublished } from '@mytechtoday/url-reference-mapper';
 * 
 * const content = 'See the file at G:\\blogs\\post.html for more info';
 * const updated = convertLocalLinksToPublished(content, './url-references.json');
 * // Result: 'See the file at https://mytech.today/post/ for more info'
 * ```
 */
export function convertLocalLinksToPublished(
  content: string,
  configPath: string,
  pathPattern?: RegExp
): string {
  const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });

  // Default pattern matches common Windows and Unix absolute paths
  // Matches paths like: G:\path\to\file.html, /path/to/file.html, C:\path\to\file.html
  const defaultPattern = /(?:[A-Z]:\\|\/)[^\s"'<>|?*]+\.(?:html?|md|txt|pdf|docx?)/gi;
  const pattern = pathPattern || defaultPattern;

  return content.replace(pattern, (localPath) => {
    const url = mapper.getUrlFromLocalPath(localPath);
    return url || localPath; // Fallback to original if no mapping found
  });
}

/**
 * Convert published URLs in content to local file paths
 * 
 * This is the reverse operation of convertLocalLinksToPublished, useful for
 * converting published content back to local development references.
 * 
 * @param content - The content containing published URLs to convert
 * @param configPath - Path to the URL reference configuration file
 * @param urlPattern - Optional regex pattern to match URLs (default matches http/https URLs)
 * @returns Content with published URLs replaced by local paths
 * 
 * @example
 * ```typescript
 * import { convertPublishedLinksToLocal } from '@mytechtoday/url-reference-mapper';
 * 
 * const content = 'See https://mytech.today/post/ for more info';
 * const updated = convertPublishedLinksToLocal(content, './url-references.json');
 * // Result: 'See G:\\blogs\\post.html for more info'
 * ```
 */
export function convertPublishedLinksToLocal(
  content: string,
  configPath: string,
  urlPattern?: RegExp
): string {
  const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });

  // Default pattern matches http/https URLs
  const defaultPattern = /https?:\/\/[^\s"'<>]+/gi;
  const pattern = urlPattern || defaultPattern;

  return content.replace(pattern, (url) => {
    const localPath = mapper.getLocalPathFromUrl(url);
    return localPath || url; // Fallback to original if no mapping found
  });
}

/**
 * Batch convert multiple local paths to published URLs
 * 
 * @param paths - Array of local file paths to convert
 * @param configPath - Path to the URL reference configuration file
 * @returns Array of objects with original path and converted URL (or null if not found)
 * 
 * @example
 * ```typescript
 * import { batchConvertPathsToUrls } from '@mytechtoday/url-reference-mapper';
 * 
 * const paths = ['G:\\blogs\\post1.html', 'G:\\blogs\\post2.html'];
 * const results = batchConvertPathsToUrls(paths, './url-references.json');
 * // Result: [
 * //   { path: 'G:\\blogs\\post1.html', url: 'https://mytech.today/post1/' },
 * //   { path: 'G:\\blogs\\post2.html', url: 'https://mytech.today/post2/' }
 * // ]
 * ```
 */
export function batchConvertPathsToUrls(
  paths: string[],
  configPath: string
): Array<{ path: string; url: string | null }> {
  const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });

  return paths.map((path) => ({
    path,
    url: mapper.getUrlFromLocalPath(path),
  }));
}

/**
 * Batch convert multiple published URLs to local paths
 * 
 * @param urls - Array of published URLs to convert
 * @param configPath - Path to the URL reference configuration file
 * @returns Array of objects with original URL and converted path (or null if not found)
 * 
 * @example
 * ```typescript
 * import { batchConvertUrlsToPaths } from '@mytechtoday/url-reference-mapper';
 * 
 * const urls = ['https://mytech.today/post1/', 'https://mytech.today/post2/'];
 * const results = batchConvertUrlsToPaths(urls, './url-references.json');
 * // Result: [
 * //   { url: 'https://mytech.today/post1/', path: 'G:\\blogs\\post1.html' },
 * //   { url: 'https://mytech.today/post2/', path: 'G:\\blogs\\post2.html' }
 * // ]
 * ```
 */
export function batchConvertUrlsToPaths(
  urls: string[],
  configPath: string
): Array<{ url: string; path: string | null }> {
  const mapper = new UrlReferenceMapper({ configPath, validateOnLoad: false });

  return urls.map((url) => ({
    url,
    path: mapper.getLocalPathFromUrl(url),
  }));
}

