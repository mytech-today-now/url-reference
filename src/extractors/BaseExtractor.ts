/**
 * Base Extractor Architecture
 * Task: uur-1-5-btl (hel.2.1)
 * 
 * Abstract base class for metadata extraction with common methods
 * for word count, reading time, links, and quotes.
 */

import { ExtractedMetadata, ExtractionConfig } from '../extractors';

/**
 * Abstract base class for all extractors
 * Provides common extraction methods and defines the extraction interface
 */
export abstract class BaseExtractor {
  protected config: ExtractionConfig;

  constructor(config: ExtractionConfig = {}) {
    this.config = {
      readingSpeed: config.readingSpeed || 225,
      maxTags: config.maxTags || 35,
      maxQuotes: config.maxQuotes || 10,
      maxLinks: config.maxLinks || 10,
      baseUrl: config.baseUrl,
    };
  }

  /**
   * Extract metadata from content
   * Must be implemented by subclasses
   * 
   * @param content - Raw content to extract from
   * @returns Extracted metadata
   */
  abstract extract(content: string): Promise<ExtractedMetadata>;

  /**
   * Count words in text content
   * Handles whitespace-separated words
   * 
   * @param text - Text content
   * @returns Word count
   */
  protected countWords(text: string): number {
    // Remove extra whitespace and split by word boundaries
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * Calculate reading time in minutes
   * 
   * @param wordCount - Number of words
   * @param wordsPerMinute - Reading speed (default from config)
   * @returns Reading time in minutes
   */
  protected calculateReadingTime(wordCount: number, wordsPerMinute?: number): number {
    const wpm = wordsPerMinute || this.config.readingSpeed || 225;
    return Math.ceil(wordCount / wpm);
  }

  /**
   * Extract links from content and categorize as internal/external
   * 
   * @param links - Array of link URLs
   * @returns Object with internal and external links
   */
  protected categorizeLinks(links: string[]): {
    internalLinks: string[];
    externalLinks: string[];
  } {
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    const maxLinks = this.config.maxLinks || 10;

    for (const link of links) {
      if (link.startsWith('http://') || link.startsWith('https://')) {
        if (this.config.baseUrl && link.startsWith(this.config.baseUrl)) {
          if (internalLinks.length < maxLinks) {
            internalLinks.push(link);
          }
        } else {
          if (externalLinks.length < maxLinks) {
            externalLinks.push(link);
          }
        }
      }

      if (internalLinks.length >= maxLinks && externalLinks.length >= maxLinks) {
        break;
      }
    }

    return { internalLinks, externalLinks };
  }

  /**
   * Extract quotes from blockquote-style content
   * 
   * @param content - Content to extract quotes from
   * @returns Array of quotes
   */
  protected extractQuotesFromBlockquotes(content: string): string[] {
    const quotes: string[] = [];
    const maxQuotes = this.config.maxQuotes || 10;
    const lines = content.split('\n');

    let currentQuote = '';
    for (const line of lines) {
      if (line.trim().startsWith('>')) {
        currentQuote += line.replace(/^>\s*/, '') + ' ';
      } else if (currentQuote) {
        quotes.push(currentQuote.trim());
        currentQuote = '';
        if (quotes.length >= maxQuotes) break;
      }
    }

    if (currentQuote && quotes.length < maxQuotes) {
      quotes.push(currentQuote.trim());
    }

    return quotes.slice(0, maxQuotes);
  }

  /**
   * Extract summary from content (first meaningful paragraph)
   * 
   * @param content - Content to extract summary from
   * @param minLength - Minimum length for a valid summary (default: 50)
   * @returns Summary text or undefined
   */
  protected extractSummary(content: string, minLength: number = 50): string | undefined {
    const paragraphs = content.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

    for (const paragraph of paragraphs) {
      // Skip headings, code blocks, and very short paragraphs
      if (!paragraph.startsWith('#') && !paragraph.startsWith('```') && paragraph.length >= minLength) {
        // Limit to first sentence or 200 characters
        const firstSentence = paragraph.match(/^[^.!?]+[.!?]/);
        if (firstSentence) {
          return firstSentence[0].trim();
        }
        return paragraph.substring(0, 200).trim() + (paragraph.length > 200 ? '...' : '');
      }
    }

    return undefined;
  }

  /**
   * Extract TLDR (200-900 characters)
   * 
   * @param content - Content to extract TLDR from
   * @returns TLDR text or undefined
   */
  protected extractTldr(content: string): string | undefined {
    const summary = this.extractSummary(content, 200);
    if (!summary) return undefined;

    // Ensure TLDR is between 200-900 characters
    if (summary.length < 200) {
      // Try to get more content
      const paragraphs = content.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
      let tldr = '';
      for (const paragraph of paragraphs) {
        if (!paragraph.startsWith('#') && !paragraph.startsWith('```')) {
          tldr += paragraph + ' ';
          if (tldr.length >= 200) break;
        }
      }
      tldr = tldr.trim();
      if (tldr.length >= 200 && tldr.length <= 900) {
        return tldr;
      }
    }

    if (summary.length >= 200 && summary.length <= 900) {
      return summary;
    }

    return undefined;
  }
}

