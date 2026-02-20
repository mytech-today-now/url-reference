import * as fs from 'fs';
import * as path from 'path';

/**
 * Metadata extraction result
 */
export interface ExtractedMetadata {
  wordCount?: number;
  readingTime?: number;
  tags?: string;
  summary?: string;
  tldr?: string;
  categories?: string;
  author?: string;
  featuredImages?: string[];
  authorImage?: string;
  authorUrl?: string;
  quotes?: string[];
  internalLinks?: string[];
  externalLinks?: string[];
  relatedPosts?: string[];
}

/**
 * Configuration for metadata extraction
 */
export interface ExtractionConfig {
  /** Words per minute for reading time calculation (default: 225) */
  readingSpeed?: number;
  /** Maximum number of tags to extract (default: 35) */
  maxTags?: number;
  /** Maximum number of quotes to extract (default: 10) */
  maxQuotes?: number;
  /** Maximum number of links to extract (default: 10) */
  maxLinks?: number;
  /** Base URL for determining internal vs external links */
  baseUrl?: string;
}

/**
 * Extract metadata from a document file
 * 
 * @param filePath - Path to the document file (MD, HTML, or TXT)
 * @param config - Optional extraction configuration
 * @returns Extracted metadata
 */
export async function extractMetadata(
  filePath: string,
  config: ExtractionConfig = {}
): Promise<ExtractedMetadata> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.md':
    case '.markdown':
      return extractFromMarkdown(content, config);
    case '.html':
    case '.htm':
      return extractFromHtml(content, config);
    case '.txt':
      return extractFromText(content, config);
    default:
      return extractFromText(content, config);
  }
}

/**
 * Extract metadata from Markdown content
 */
function extractFromMarkdown(content: string, config: ExtractionConfig): ExtractedMetadata {
  const metadata: ExtractedMetadata = {};

  // Extract frontmatter if present
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    
    // Extract author from frontmatter
    const authorMatch = frontmatter.match(/author:\s*(.+)/i);
    if (authorMatch) metadata.author = authorMatch[1].trim();
    
    // Extract categories from frontmatter
    const categoriesMatch = frontmatter.match(/categories?:\s*(.+)/i);
    if (categoriesMatch) metadata.categories = categoriesMatch[1].trim();
    
    // Extract tags from frontmatter
    const tagsMatch = frontmatter.match(/tags?:\s*(.+)/i);
    if (tagsMatch) metadata.tags = tagsMatch[1].trim();
  }

  // Remove frontmatter for text analysis
  const textContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Extract word count and reading time
  const wordCount = countWords(textContent);
  metadata.wordCount = wordCount;
  metadata.readingTime = calculateReadingTime(wordCount, config.readingSpeed || 225);

  // Extract quotes (text in blockquotes)
  const quotes = extractQuotes(textContent, config.maxQuotes || 10);
  if (quotes.length > 0) metadata.quotes = quotes;

  // Extract links
  const { internalLinks, externalLinks } = extractLinks(textContent, config.baseUrl, config.maxLinks || 10);
  if (internalLinks.length > 0) metadata.internalLinks = internalLinks;
  if (externalLinks.length > 0) metadata.externalLinks = externalLinks;

  // Extract images
  const images = extractMarkdownImages(textContent);
  if (images.length > 0) metadata.featuredImages = images;

  // Extract summary (first paragraph after heading)
  const summary = extractSummary(textContent);
  if (summary) metadata.summary = summary;

  // Extract TLDR (200-900 chars)
  const tldr = extractTldr(textContent);
  if (tldr) metadata.tldr = tldr;

  return metadata;
}

/**
 * Extract metadata from HTML content
 */
function extractFromHtml(content: string, config: ExtractionConfig): ExtractedMetadata {
  const metadata: ExtractedMetadata = {};

  // Extract meta tags
  const authorMatch = content.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
  if (authorMatch) metadata.author = authorMatch[1];

  const descriptionMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (descriptionMatch) metadata.summary = descriptionMatch[1];

  const keywordsMatch = content.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  if (keywordsMatch) metadata.tags = keywordsMatch[1];

  // Strip HTML tags for text analysis
  const textContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract word count and reading time
  const wordCount = countWords(textContent);
  metadata.wordCount = wordCount;
  metadata.readingTime = calculateReadingTime(wordCount, config.readingSpeed || 225);

  // Extract links from HTML
  const { internalLinks, externalLinks } = extractHtmlLinks(content, config.baseUrl, config.maxLinks || 10);
  if (internalLinks.length > 0) metadata.internalLinks = internalLinks;
  if (externalLinks.length > 0) metadata.externalLinks = externalLinks;

  // Extract images
  const images = extractHtmlImages(content);
  if (images.length > 0) metadata.featuredImages = images;

  // Extract quotes from HTML blockquotes
  const quotes = extractHtmlQuotes(content, config.maxQuotes || 10);
  if (quotes.length > 0) metadata.quotes = quotes;

  // Extract TLDR from text content
  const tldr = extractTldr(textContent);
  if (tldr) metadata.tldr = tldr;

  return metadata;
}

/**
 * Extract metadata from plain text content
 */
function extractFromText(content: string, config: ExtractionConfig): ExtractedMetadata {
  const metadata: ExtractedMetadata = {};

  // Extract word count and reading time
  const wordCount = countWords(content);
  metadata.wordCount = wordCount;
  metadata.readingTime = calculateReadingTime(wordCount, config.readingSpeed || 225);

  // Extract quotes (lines starting with > or in quotes)
  const quotes = extractQuotes(content, config.maxQuotes || 10);
  if (quotes.length > 0) metadata.quotes = quotes;

  // Extract URLs
  const { internalLinks, externalLinks } = extractTextLinks(content, config.baseUrl, config.maxLinks || 10);
  if (internalLinks.length > 0) metadata.internalLinks = internalLinks;
  if (externalLinks.length > 0) metadata.externalLinks = externalLinks;

  // Extract summary and TLDR
  const summary = extractSummary(content);
  if (summary) metadata.summary = summary;

  const tldr = extractTldr(content);
  if (tldr) metadata.tldr = tldr;

  return metadata;
}

/**
 * Count words in text content
 */
function countWords(text: string): number {
  // Remove extra whitespace and split by word boundaries
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(wordCount: number, wordsPerMinute: number): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract quotes from Markdown blockquotes
 */
function extractQuotes(content: string, maxQuotes: number): string[] {
  const quotes: string[] = [];
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
 * Extract quotes from HTML blockquotes
 */
function extractHtmlQuotes(content: string, maxQuotes: number): string[] {
  const quotes: string[] = [];

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

/**
 * Extract links from Markdown content
 */
function extractLinks(
  content: string,
  baseUrl: string | undefined,
  maxLinks: number
): { internalLinks: string[]; externalLinks: string[] } {
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  // Match Markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];

    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (baseUrl && url.startsWith(baseUrl)) {
        if (internalLinks.length < maxLinks) internalLinks.push(url);
      } else {
        if (externalLinks.length < maxLinks) externalLinks.push(url);
      }
    }

    if (internalLinks.length >= maxLinks && externalLinks.length >= maxLinks) break;
  }

  return { internalLinks, externalLinks };
}

/**
 * Extract links from HTML content
 */
function extractHtmlLinks(
  content: string,
  baseUrl: string | undefined,
  maxLinks: number
): { internalLinks: string[]; externalLinks: string[] } {
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  // Match HTML links: <a href="url">
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[1];

    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (baseUrl && url.startsWith(baseUrl)) {
        if (internalLinks.length < maxLinks) internalLinks.push(url);
      } else {
        if (externalLinks.length < maxLinks) externalLinks.push(url);
      }
    }

    if (internalLinks.length >= maxLinks && externalLinks.length >= maxLinks) break;
  }

  return { internalLinks, externalLinks };
}

/**
 * Extract links from plain text
 */
function extractTextLinks(
  content: string,
  baseUrl: string | undefined,
  maxLinks: number
): { internalLinks: string[]; externalLinks: string[] } {
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  // Match URLs in text
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0];

    if (baseUrl && url.startsWith(baseUrl)) {
      if (internalLinks.length < maxLinks) internalLinks.push(url);
    } else {
      if (externalLinks.length < maxLinks) externalLinks.push(url);
    }

    if (internalLinks.length >= maxLinks && externalLinks.length >= maxLinks) break;
  }

  return { internalLinks, externalLinks };
}

/**
 * Extract images from Markdown content
 */
function extractMarkdownImages(content: string): string[] {
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

/**
 * Extract images from HTML content
 */
function extractHtmlImages(content: string): string[] {
  const images: string[] = [];

  // Match HTML images: <img src="url">
  const imageRegex = /<img\s+[^>]*src=["']([^"']+)["']/gi;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      images.push(url);
    }
  }

  return images;
}

/**
 * Extract summary from content (first meaningful paragraph)
 */
function extractSummary(content: string): string | undefined {
  // Remove frontmatter
  const textContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Split into paragraphs
  const paragraphs = textContent.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

  // Find first paragraph that's not a heading and has reasonable length
  for (const para of paragraphs) {
    if (!para.startsWith('#') && para.length > 50 && para.length < 500) {
      // Remove markdown formatting
      const cleaned = para
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/[*_`]/g, '') // Remove emphasis
        .replace(/^>\s*/gm, '') // Remove blockquote markers
        .trim();

      // Return first sentence if it's long enough
      const firstSentence = cleaned.split(/[.!?]\s/)[0];
      if (firstSentence && firstSentence.length > 30) {
        return firstSentence + '.';
      }
    }
  }

  return undefined;
}

/**
 * Extract TLDR (Too Long; Didn't Read) summary from content
 * Generates a 200-900 character summary from the first few paragraphs
 */
function extractTldr(content: string): string | undefined {
  // Remove frontmatter
  const textContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Split into paragraphs
  const paragraphs = textContent
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith('#'));

  if (paragraphs.length === 0) return undefined;

  // Combine first few paragraphs until we reach 200-900 chars
  let tldr = '';
  for (const para of paragraphs) {
    // Remove markdown formatting
    const cleaned = para
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/[*_`]/g, '') // Remove emphasis
      .replace(/^>\s*/gm, '') // Remove blockquote markers
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
      .trim();

    if (cleaned.length > 0) {
      if (tldr.length === 0) {
        tldr = cleaned;
      } else {
        tldr += ' ' + cleaned;
      }

      // Stop if we've reached a good length
      if (tldr.length >= 200) {
        break;
      }
    }
  }

  // Truncate to 900 chars if needed
  if (tldr.length > 900) {
    tldr = tldr.substring(0, 897) + '...';
  }

  // Return only if we have at least 200 chars
  return tldr.length >= 200 ? tldr : undefined;
}

