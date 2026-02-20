/**
 * HTML Parser
 * Task: uur.1.7.0
 * 
 * Implements HTML parsing using cheerio to extract:
 * - Plain text content (stripped of tags)
 * - Meta tags (og:, twitter:, standard meta)
 * - Links (a href)
 * - Images (img src, og:image)
 */

import * as cheerio from 'cheerio';

export interface HtmlParseResult {
  /** Plain text content (tags stripped) */
  text: string;
  /** Parsed meta tags */
  meta: {
    title?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    [key: string]: any;
  };
  /** Extracted links */
  links: Array<{
    url: string;
    text?: string;
    title?: string;
  }>;
  /** Extracted images */
  images: Array<{
    src: string;
    alt?: string;
    title?: string;
  }>;
}

/**
 * Parse HTML content and extract text, meta tags, links, and images
 * 
 * @param html - Raw HTML content
 * @returns Parsed HTML data
 */
export function parseHtml(html: string): HtmlParseResult {
  try {
    const $ = cheerio.load(html, {
      xml: {
        xmlMode: false,
      },
    });

    // Extract plain text (strip all tags)
    const text = extractPlainText($);

    // Extract meta tags
    const meta = extractMetaTags($);

    // Extract links
    const links = extractLinks($);

    // Extract images
    const images = extractImages($);

    return {
      text,
      meta,
      links,
      images,
    };
  } catch (error) {
    // Handle malformed HTML gracefully
    console.warn('HTML parsing error:', error);
    
    // Fallback: return minimal data
    return {
      text: html.replace(/<[^>]*>/g, ''), // Simple tag stripping
      meta: {},
      links: [],
      images: [],
    };
  }
}

/**
 * Extract plain text from HTML (strip all tags)
 */
function extractPlainText($: cheerio.CheerioAPI): string {
  // Remove script and style elements
  $('script, style, noscript').remove();

  // Get text content
  const text = $('body').text() || $.text();

  // Normalize whitespace
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract meta tags from HTML
 */
function extractMetaTags($: cheerio.CheerioAPI): HtmlParseResult['meta'] {
  const meta: HtmlParseResult['meta'] = {};

  // Standard meta tags
  meta.title = $('title').text() || $('meta[property="og:title"]').attr('content');
  meta.description = $('meta[name="description"]').attr('content');
  meta.keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim());
  meta.author = $('meta[name="author"]').attr('content');

  // Open Graph meta tags
  meta.ogTitle = $('meta[property="og:title"]').attr('content');
  meta.ogDescription = $('meta[property="og:description"]').attr('content');
  meta.ogImage = $('meta[property="og:image"]').attr('content');
  meta.ogUrl = $('meta[property="og:url"]').attr('content');

  // Twitter Card meta tags
  meta.twitterCard = $('meta[name="twitter:card"]').attr('content');
  meta.twitterTitle = $('meta[name="twitter:title"]').attr('content');
  meta.twitterDescription = $('meta[name="twitter:description"]').attr('content');
  meta.twitterImage = $('meta[name="twitter:image"]').attr('content');

  // Remove undefined values
  Object.keys(meta).forEach(key => {
    if (meta[key] === undefined) {
      delete meta[key];
    }
  });

  return meta;
}

/**
 * Extract links from HTML
 */
function extractLinks($: cheerio.CheerioAPI): HtmlParseResult['links'] {
  const links: HtmlParseResult['links'] = [];

  $('a[href]').each((_, element) => {
    const $el = $(element);
    const href = $el.attr('href');
    
    if (href) {
      links.push({
        url: href,
        text: $el.text().trim() || undefined,
        title: $el.attr('title') || undefined,
      });
    }
  });

  return links;
}

/**
 * Extract images from HTML
 */
function extractImages($: cheerio.CheerioAPI): HtmlParseResult['images'] {
  const images: HtmlParseResult['images'] = [];

  $('img[src]').each((_, element) => {
    const $el = $(element);
    const src = $el.attr('src');
    
    if (src) {
      images.push({
        src,
        alt: $el.attr('alt') || undefined,
        title: $el.attr('title') || undefined,
      });
    }
  });

  return images;
}

