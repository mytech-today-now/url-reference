/**
 * HTML Extractor
 * Task: uur-1-5-btl (hel.2.1)
 * 
 * Extracts metadata from HTML documents using the existing
 * HTML parser and extraction utilities.
 */

import { BaseExtractor } from './BaseExtractor';
import { ExtractedMetadata } from '../extractors';
import { parseHtml } from '../parsers/html-parser';

/**
 * Extractor for HTML documents
 */
export class HtmlExtractor extends BaseExtractor {
  /**
   * Extract metadata from HTML content
   * 
   * @param content - Raw HTML content
   * @returns Extracted metadata
   */
  async extract(content: string): Promise<ExtractedMetadata> {
    const metadata: ExtractedMetadata = {};

    try {
      // Parse HTML using the existing parser
      const parsed = parseHtml(content);

      // Extract metadata from meta tags
      if (parsed.meta) {
        const meta = parsed.meta;
        
        if (meta.author) metadata.author = meta.author;
        if (meta.description) metadata.summary = meta.description;
        if (meta.keywords) {
          const keywords = Array.isArray(meta.keywords)
            ? meta.keywords
            : (meta.keywords as string).split(',').map((k: string) => k.trim());
          metadata.tags = keywords.slice(0, this.config.maxTags || 35).join(', ');
        }
        
        // Open Graph metadata
        if (meta.ogImage) metadata.featuredImages = [meta.ogImage];
        if (meta.ogDescription && !metadata.summary) {
          metadata.summary = meta.ogDescription;
        }
        
        // Twitter Card metadata
        if (meta.twitterImage && !metadata.featuredImages) {
          metadata.featuredImages = [meta.twitterImage];
        }
        if (meta.twitterDescription && !metadata.summary) {
          metadata.summary = meta.twitterDescription;
        }
      }

      // Extract word count and reading time from plain text
      const wordCount = this.countWords(parsed.text);
      metadata.wordCount = wordCount;
      metadata.readingTime = this.calculateReadingTime(wordCount);

      // Extract and categorize links
      if (parsed.links && parsed.links.length > 0) {
        const linkUrls = parsed.links.map(l => l.url);
        const { internalLinks, externalLinks } = this.categorizeLinks(linkUrls);
        if (internalLinks.length > 0) metadata.internalLinks = internalLinks;
        if (externalLinks.length > 0) metadata.externalLinks = externalLinks;
      }

      // Extract images
      if (parsed.images && parsed.images.length > 0 && !metadata.featuredImages) {
        const imageUrls = parsed.images
          .map(img => img.src)
          .filter(src => src.startsWith('http://') || src.startsWith('https://'));
        if (imageUrls.length > 0) {
          metadata.featuredImages = imageUrls;
        }
      }

      // Extract quotes from blockquotes in HTML
      const quotes = this.extractHtmlQuotes(content);
      if (quotes.length > 0) metadata.quotes = quotes;

      // Extract summary if not from meta tags
      if (!metadata.summary) {
        const summary = this.extractSummary(parsed.text);
        if (summary) metadata.summary = summary;
      }

      // Extract TLDR
      const tldr = this.extractTldr(parsed.text);
      if (tldr) metadata.tldr = tldr;

    } catch (error) {
      console.warn('HTML extraction error:', error);
      // Fallback to basic text extraction
      const textContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = this.countWords(textContent);
      metadata.wordCount = wordCount;
      metadata.readingTime = this.calculateReadingTime(wordCount);
    }

    return metadata;
  }

  /**
   * Extract quotes from HTML blockquotes
   * 
   * @param content - HTML content
   * @returns Array of quotes
   */
  private extractHtmlQuotes(content: string): string[] {
    const quotes: string[] = [];
    const maxQuotes = this.config.maxQuotes || 10;

    // Match <blockquote> tags and extract their content
    const blockquoteRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
    let match;

    while ((match = blockquoteRegex.exec(content)) !== null && quotes.length < maxQuotes) {
      // Strip HTML tags from the blockquote content
      const quoteText = match[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (quoteText.length > 0) {
        quotes.push(quoteText);
      }
    }

    return quotes.slice(0, maxQuotes);
  }
}

