/**
 * Text Extractor
 * Task: uur-1-5-btl (hel.2.1)
 * 
 * Extracts metadata from plain text documents.
 */

import { BaseExtractor } from './BaseExtractor';
import { ExtractedMetadata } from '../extractors';
import { extractUrls, normalizeLineEndings } from '../parsers/text-parser';

/**
 * Extractor for plain text documents
 */
export class TextExtractor extends BaseExtractor {
  /**
   * Extract metadata from plain text content
   * 
   * @param content - Raw text content
   * @returns Extracted metadata
   */
  async extract(content: string): Promise<ExtractedMetadata> {
    const metadata: ExtractedMetadata = {};

    try {
      // Normalize line endings
      const normalizedContent = normalizeLineEndings(content);

      // Extract word count and reading time
      const wordCount = this.countWords(normalizedContent);
      metadata.wordCount = wordCount;
      metadata.readingTime = this.calculateReadingTime(wordCount);

      // Extract quotes (lines starting with > or in quotes)
      const quotes = this.extractQuotesFromBlockquotes(normalizedContent);
      if (quotes.length > 0) metadata.quotes = quotes;

      // Extract URLs and categorize them
      const urls = extractUrls(normalizedContent);
      if (urls.length > 0) {
        const { internalLinks, externalLinks } = this.categorizeLinks(urls);
        if (internalLinks.length > 0) metadata.internalLinks = internalLinks;
        if (externalLinks.length > 0) metadata.externalLinks = externalLinks;
      }

      // Extract summary (first meaningful paragraph)
      const summary = this.extractSummary(normalizedContent);
      if (summary) metadata.summary = summary;

      // Extract TLDR
      const tldr = this.extractTldr(normalizedContent);
      if (tldr) metadata.tldr = tldr;

    } catch (error) {
      console.warn('Text extraction error:', error);
      // Fallback to basic word count
      const wordCount = this.countWords(content);
      metadata.wordCount = wordCount;
      metadata.readingTime = this.calculateReadingTime(wordCount);
    }

    return metadata;
  }
}

