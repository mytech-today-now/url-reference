/**
 * BaseExtractor Tests
 * Task: uur-1-5-btl (hel.2.1)
 */

import { BaseExtractor } from '../../extractors/BaseExtractor';
import { ExtractedMetadata } from '../../extractors';

// Concrete implementation for testing
class TestExtractor extends BaseExtractor {
  async extract(content: string): Promise<ExtractedMetadata> {
    return {
      wordCount: this.countWords(content),
      readingTime: this.calculateReadingTime(this.countWords(content)),
    };
  }

  // Expose protected methods for testing
  public testCountWords(text: string): number {
    return this.countWords(text);
  }

  public testCalculateReadingTime(wordCount: number, wpm?: number): number {
    return this.calculateReadingTime(wordCount, wpm);
  }

  public testCategorizeLinks(links: string[]): { internalLinks: string[]; externalLinks: string[] } {
    return this.categorizeLinks(links);
  }

  public testExtractQuotes(content: string): string[] {
    return this.extractQuotesFromBlockquotes(content);
  }

  public testExtractSummary(content: string, minLength?: number): string | undefined {
    return this.extractSummary(content, minLength);
  }

  public testExtractTldr(content: string): string | undefined {
    return this.extractTldr(content);
  }
}

describe('BaseExtractor', () => {
  let extractor: TestExtractor;

  beforeEach(() => {
    extractor = new TestExtractor();
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(extractor.testCountWords('Hello world')).toBe(2);
      expect(extractor.testCountWords('One two three four five')).toBe(5);
    });

    it('should handle extra whitespace', () => {
      expect(extractor.testCountWords('  Hello   world  ')).toBe(2);
      expect(extractor.testCountWords('Hello\n\nworld')).toBe(2);
    });

    it('should handle empty strings', () => {
      expect(extractor.testCountWords('')).toBe(0);
      expect(extractor.testCountWords('   ')).toBe(0);
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time with default speed', () => {
      expect(extractor.testCalculateReadingTime(225)).toBe(1);
      expect(extractor.testCalculateReadingTime(450)).toBe(2);
      expect(extractor.testCalculateReadingTime(300)).toBe(2); // Rounds up
    });

    it('should calculate reading time with custom speed', () => {
      expect(extractor.testCalculateReadingTime(200, 200)).toBe(1);
      expect(extractor.testCalculateReadingTime(400, 200)).toBe(2);
    });

    it('should round up to nearest minute', () => {
      expect(extractor.testCalculateReadingTime(226)).toBe(2);
      expect(extractor.testCalculateReadingTime(1)).toBe(1);
    });
  });

  describe('categorizeLinks', () => {
    it('should categorize internal and external links', () => {
      const extractor = new TestExtractor({ baseUrl: 'https://example.com' });
      const links = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://external.com/page',
        'https://another.com/page',
      ];

      const result = extractor.testCategorizeLinks(links);

      expect(result.internalLinks).toHaveLength(2);
      expect(result.externalLinks).toHaveLength(2);
    });

    it('should respect maxLinks configuration', () => {
      const extractor = new TestExtractor({ baseUrl: 'https://example.com', maxLinks: 2 });
      const links = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        'https://external.com/page1',
        'https://external.com/page2',
        'https://external.com/page3',
      ];

      const result = extractor.testCategorizeLinks(links);

      expect(result.internalLinks.length).toBeLessThanOrEqual(2);
      expect(result.externalLinks.length).toBeLessThanOrEqual(2);
    });

    it('should handle links without baseUrl', () => {
      const links = [
        'https://example.com/page1',
        'https://external.com/page',
      ];

      const result = extractor.testCategorizeLinks(links);

      expect(result.internalLinks).toHaveLength(0);
      expect(result.externalLinks).toHaveLength(2);
    });
  });

  describe('extractQuotesFromBlockquotes', () => {
    it('should extract quotes from blockquote syntax', () => {
      const content = `
> This is a quote
> spanning multiple lines

Some text

> Another quote
`;

      const quotes = extractor.testExtractQuotes(content);

      expect(quotes).toHaveLength(2);
      expect(quotes[0]).toContain('This is a quote');
      expect(quotes[1]).toContain('Another quote');
    });

    it('should respect maxQuotes configuration', () => {
      const extractor = new TestExtractor({ maxQuotes: 2 });
      const content = `
> Quote 1
> Quote 2
> Quote 3
`;

      const quotes = extractor.testExtractQuotes(content);

      expect(quotes.length).toBeLessThanOrEqual(2);
    });
  });

  describe('extractSummary', () => {
    it('should extract first meaningful paragraph', () => {
      const content = `
# Heading

This is the first paragraph with enough content to be a valid summary.

This is the second paragraph.
`;

      const summary = extractor.testExtractSummary(content);

      expect(summary).toBeDefined();
      expect(summary).toContain('first paragraph');
    });

    it('should skip headings and code blocks', () => {
      const content = `
# Heading

\`\`\`
code block
\`\`\`

This is the actual content with enough words to be a valid summary paragraph.
`;

      const summary = extractor.testExtractSummary(content);

      expect(summary).toBeDefined();
      if (summary) {
        expect(summary).toContain('actual content');
      }
    });
  });
});

