import { extractMetadata } from '../extractors';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Metadata Extraction', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extractor-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Markdown extraction', () => {
    it('should extract word count and reading time', async () => {
      const content = `# Test Document

This is a test document with some content. It has multiple sentences.
And multiple paragraphs to test word counting.

This is another paragraph with more words to count.`;

      const filePath = path.join(tempDir, 'test.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.readingTime).toBeGreaterThan(0);
      expect(metadata.readingTime).toBe(Math.ceil(metadata.wordCount! / 225));
    });

    it('should extract frontmatter metadata', async () => {
      const content = `---
author: John Doe
categories: Technology, Programming
tags: typescript, testing, metadata
---

# Test Document

Content goes here.`;

      const filePath = path.join(tempDir, 'frontmatter.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.author).toBe('John Doe');
      expect(metadata.categories).toBe('Technology, Programming');
      expect(metadata.tags).toBe('typescript, testing, metadata');
    });

    it('should extract quotes from blockquotes', async () => {
      const content = `# Document with Quotes

> This is a quote from someone important.

Some regular text.

> Another insightful quote.
> That spans multiple lines.

More text.`;

      const filePath = path.join(tempDir, 'quotes.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.quotes).toBeDefined();
      expect(metadata.quotes!.length).toBeGreaterThan(0);
      expect(metadata.quotes![0]).toContain('quote from someone important');
    });

    it('should extract markdown links', async () => {
      const content = `# Document with Links

Check out [this internal link](https://example.com/internal/page).
And [this external link](https://external.com/page).

[Another internal](https://example.com/another).`;

      const filePath = path.join(tempDir, 'links.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath, { baseUrl: 'https://example.com' });

      expect(metadata.internalLinks).toBeDefined();
      expect(metadata.externalLinks).toBeDefined();
      expect(metadata.internalLinks!.length).toBeGreaterThan(0);
      expect(metadata.externalLinks!.length).toBeGreaterThan(0);
    });

    it('should extract markdown images', async () => {
      const content = `# Document with Images

![Alt text](https://example.com/image1.jpg)

Some text.

![Another image](https://example.com/image2.png)`;

      const filePath = path.join(tempDir, 'images.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.featuredImages).toBeDefined();
      expect(metadata.featuredImages!.length).toBe(2);
      expect(metadata.featuredImages![0]).toBe('https://example.com/image1.jpg');
    });

    it('should extract summary from first paragraph', async () => {
      const content = `# Test Document

This is the first meaningful paragraph that should be extracted as a summary. It contains enough text to be considered.

This is a second paragraph that should not be included.`;

      const filePath = path.join(tempDir, 'summary.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.summary).toBeDefined();
      expect(metadata.summary).toContain('first meaningful paragraph');
    });

    it('should respect max limits for quotes and links', async () => {
      const quotes = Array.from({ length: 15 }, (_, i) => `> Quote number ${i + 1}`).join('\n\n');
      const content = `# Document\n\n${quotes}`;

      const filePath = path.join(tempDir, 'limits.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath, { maxQuotes: 5 });

      expect(metadata.quotes).toBeDefined();
      expect(metadata.quotes!.length).toBeLessThanOrEqual(5);
    });

    it('should extract TLDR summary (200-900 chars)', async () => {
      const content = `# Test Document

This is the first paragraph with enough content to create a meaningful TLDR summary. It needs to be at least 200 characters long to be considered valid. This paragraph continues with more information about the topic being discussed.

This is a second paragraph that adds more context and details. It helps to reach the minimum character count for a proper TLDR summary that provides value to readers.

This is a third paragraph with even more content to ensure we have enough text.`;

      const filePath = path.join(tempDir, 'tldr.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.tldr).toBeDefined();
      expect(metadata.tldr!.length).toBeGreaterThanOrEqual(200);
      expect(metadata.tldr!.length).toBeLessThanOrEqual(900);
    });

    it('should not extract TLDR if content is too short', async () => {
      const content = `# Short Document

This is too short.`;

      const filePath = path.join(tempDir, 'short-tldr.md');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.tldr).toBeUndefined();
    });
  });

  describe('HTML extraction', () => {
    it('should extract meta tags', async () => {
      const content = `<!DOCTYPE html>
<html>
<head>
  <meta name="author" content="Jane Smith">
  <meta name="description" content="This is a test description">
  <meta name="keywords" content="html, testing, metadata">
</head>
<body>
  <p>Content goes here.</p>
</body>
</html>`;

      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.author).toBe('Jane Smith');
      expect(metadata.summary).toBe('This is a test description');
      expect(metadata.tags).toBe('html, testing, metadata');
    });

    it('should extract word count from HTML', async () => {
      const content = `<!DOCTYPE html>
<html>
<body>
  <h1>Test Heading</h1>
  <p>This is a paragraph with some words.</p>
  <p>Another paragraph with more content to count.</p>
</body>
</html>`;

      const filePath = path.join(tempDir, 'wordcount.html');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.readingTime).toBeGreaterThan(0);
    });

    it('should extract HTML links', async () => {
      const content = `<!DOCTYPE html>
<html>
<body>
  <a href="https://example.com/page1">Internal Link</a>
  <a href="https://external.com/page">External Link</a>
  <a href="https://example.com/page2">Another Internal</a>
</body>
</html>`;

      const filePath = path.join(tempDir, 'links.html');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath, { baseUrl: 'https://example.com' });

      expect(metadata.internalLinks).toBeDefined();
      expect(metadata.externalLinks).toBeDefined();
    });

    it('should extract HTML images', async () => {
      const content = `<!DOCTYPE html>
<html>
<body>
  <img src="https://example.com/image1.jpg" alt="Image 1">
  <img src="https://example.com/image2.png" alt="Image 2">
</body>
</html>`;

      const filePath = path.join(tempDir, 'images.html');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.featuredImages).toBeDefined();
      expect(metadata.featuredImages!.length).toBe(2);
    });

    it('should extract HTML blockquotes', async () => {
      const content = `<!DOCTYPE html>
<html>
<body>
  <p>Some text before the quote.</p>
  <blockquote>
    <p>This is an important quote from someone.</p>
  </blockquote>
  <p>More text.</p>
  <blockquote>
    Another quote that spans multiple lines
    and contains important information.
  </blockquote>
</body>
</html>`;

      const filePath = path.join(tempDir, 'blockquotes.html');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.quotes).toBeDefined();
      expect(metadata.quotes!.length).toBeGreaterThan(0);
      expect(metadata.quotes![0]).toContain('important quote');
    });

    it('should extract TLDR from HTML', async () => {
      const content = `<!DOCTYPE html>
<html>
<body>
  <h1>Test Article</h1>
  <p>This is the first paragraph with enough content to create a meaningful TLDR summary. It needs to be at least 200 characters long to be considered valid. This paragraph continues with more information about the topic being discussed.</p>
  <p>This is a second paragraph that adds more context and details. It helps to reach the minimum character count for a proper TLDR summary that provides value to readers.</p>
</body>
</html>`;

      const filePath = path.join(tempDir, 'tldr.html');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.tldr).toBeDefined();
      expect(metadata.tldr!.length).toBeGreaterThanOrEqual(200);
      expect(metadata.tldr!.length).toBeLessThanOrEqual(900);
    });
  });

  describe('Plain text extraction', () => {
    it('should extract word count from plain text', async () => {
      const content = `This is a plain text document.
It has multiple lines and paragraphs.

This is another paragraph with more words to count.`;

      const filePath = path.join(tempDir, 'test.txt');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.readingTime).toBeGreaterThan(0);
    });

    it('should extract URLs from plain text', async () => {
      const content = `Check out https://example.com/page1 for more info.
Also see https://external.com/page for external resources.
And https://example.com/page2 for another internal link.`;

      const filePath = path.join(tempDir, 'urls.txt');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath, { baseUrl: 'https://example.com' });

      expect(metadata.internalLinks).toBeDefined();
      expect(metadata.externalLinks).toBeDefined();
    });

    it('should extract summary and TLDR from plain text', async () => {
      const content = `This is the first meaningful paragraph that should be extracted as a summary. It contains enough text to be considered valid and useful for readers.

This is a second paragraph that adds more context and details. It helps to reach the minimum character count for a proper TLDR summary that provides value to readers who want a quick overview.

This is a third paragraph with even more content to ensure we have enough text for both summary and TLDR extraction.`;

      const filePath = path.join(tempDir, 'summary-tldr.txt');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.summary).toBeDefined();
      expect(metadata.summary).toContain('first meaningful paragraph');
      expect(metadata.tldr).toBeDefined();
      expect(metadata.tldr!.length).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Custom reading speed', () => {
    it('should calculate reading time with custom speed', async () => {
      const content = Array.from({ length: 500 }, () => 'word').join(' ');
      const filePath = path.join(tempDir, 'speed.md');
      fs.writeFileSync(filePath, content);

      const metadata1 = await extractMetadata(filePath, { readingSpeed: 200 });
      const metadata2 = await extractMetadata(filePath, { readingSpeed: 250 });

      expect(metadata1.readingTime).toBeGreaterThan(metadata2.readingTime!);
    });
  });

  describe('Error handling', () => {
    it('should throw error for non-existent file', async () => {
      await expect(extractMetadata('/non/existent/file.md')).rejects.toThrow('File not found');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty files', async () => {
      const filePath = path.join(tempDir, 'empty.md');
      fs.writeFileSync(filePath, '');

      const metadata = await extractMetadata(filePath);

      expect(metadata.wordCount).toBe(0);
      expect(metadata.readingTime).toBe(0);
    });

    it('should handle files with only whitespace', async () => {
      const filePath = path.join(tempDir, 'whitespace.md');
      fs.writeFileSync(filePath, '   \n\n   \t\t   ');

      const metadata = await extractMetadata(filePath);

      expect(metadata.wordCount).toBe(0);
    });

    it('should handle files without extension', async () => {
      const content = 'This is a file without extension.';
      const filePath = path.join(tempDir, 'noext');
      fs.writeFileSync(filePath, content);

      const metadata = await extractMetadata(filePath);

      expect(metadata.wordCount).toBeGreaterThan(0);
    });
  });
});


