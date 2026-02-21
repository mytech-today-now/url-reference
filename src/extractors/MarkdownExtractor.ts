/**
 * Markdown Extractor
 * Task: uur-1-5-btl (hel.2.1)
 * 
 * Extracts metadata from Markdown documents using the existing
 * markdown parser and extraction utilities.
 */

import { BaseExtractor } from './BaseExtractor';
import { ExtractedMetadata } from '../extractors';
import { parseMarkdown } from '../parsers/markdown-parser';

/**
 * Extractor for Markdown documents
 */
export class MarkdownExtractor extends BaseExtractor {
  /**
   * Extract metadata from Markdown content
   * 
   * @param content - Raw Markdown content
   * @returns Extracted metadata
   */
  async extract(content: string): Promise<ExtractedMetadata> {
    const metadata: ExtractedMetadata = {};

    try {
      // Parse Markdown using the existing parser
      const parsed = await parseMarkdown(content);

      // Extract frontmatter metadata
      if (parsed.frontmatter) {
        const fm = parsed.frontmatter;
        
        if (fm.author) metadata.author = String(fm.author);
        if (fm.categories) {
          metadata.categories = Array.isArray(fm.categories) 
            ? fm.categories.join(', ') 
            : String(fm.categories);
        }
        if (fm.tags) {
          metadata.tags = Array.isArray(fm.tags) 
            ? fm.tags.slice(0, this.config.maxTags || 35).join(', ') 
            : String(fm.tags);
        }
        if (fm.summary) metadata.summary = String(fm.summary);
        if (fm.tldr) metadata.tldr = String(fm.tldr);
        if (fm.authorImage) metadata.authorImage = String(fm.authorImage);
        if (fm.authorUrl) metadata.authorUrl = String(fm.authorUrl);
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

      // Extract quotes from blockquotes
      const quotes = this.extractQuotesFromBlockquotes(content);
      if (quotes.length > 0) metadata.quotes = quotes;

      // Extract images from Markdown
      const images = this.extractMarkdownImages(content);
      if (images.length > 0) metadata.featuredImages = images;

      // Extract summary if not in frontmatter
      if (!metadata.summary) {
        const summary = this.extractSummary(parsed.text);
        if (summary) metadata.summary = summary;
      }

      // Extract TLDR if not in frontmatter
      if (!metadata.tldr) {
        const tldr = this.extractTldr(parsed.text);
        if (tldr) metadata.tldr = tldr;
      }

    } catch (error) {
      console.warn('Markdown extraction error:', error);
      // Fallback to basic text extraction
      const wordCount = this.countWords(content);
      metadata.wordCount = wordCount;
      metadata.readingTime = this.calculateReadingTime(wordCount);
    }

    return metadata;
  }

  /**
   * Extract images from Markdown content
   * 
   * @param content - Markdown content
   * @returns Array of image URLs
   */
  private extractMarkdownImages(content: string): string[] {
    const images: string[] = [];
    
    // Match Markdown images: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const url = match[2];
      if (url.startsWith('http://') || url.startsWith('https://')) {
        images.push(url);
      }
    }

    return images;
  }
}

