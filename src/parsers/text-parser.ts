/**
 * Plain Text Parser
 * Task: uur.1.8.0
 * 
 * Implements plain text parsing with:
 * - Text content extraction
 * - URL detection using regex
 * - Different line ending support
 * - UTF-8 encoding support
 */

export interface TextParseResult {
  /** Plain text content */
  text: string;
  /** Detected URLs */
  urls: string[];
  /** Line count */
  lineCount: number;
  /** Character count */
  charCount: number;
}

/**
 * URL detection regex pattern
 * Matches http:// and https:// URLs
 */
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

/**
 * Parse plain text content and extract URLs
 * 
 * @param content - Raw text content
 * @returns Parsed text data
 */
export function parseText(content: string): TextParseResult {
  try {
    // Normalize line endings (handle \r\n, \n, \r)
    const normalizedText = normalizeLineEndings(content);

    // Extract URLs
    const urls = extractUrls(normalizedText);

    // Count lines
    const lines = normalizedText.split('\n');
    const lineCount = lines.length;

    // Count characters
    const charCount = normalizedText.length;

    return {
      text: normalizedText,
      urls,
      lineCount,
      charCount,
    };
  } catch (error) {
    console.warn('Text parsing error:', error);
    
    // Fallback
    return {
      text: content,
      urls: [],
      lineCount: 1,
      charCount: content.length,
    };
  }
}

/**
 * Normalize line endings to \n
 * Handles Windows (\r\n), Unix (\n), and Mac (\r) line endings
 * 
 * @param text - Text with mixed line endings
 * @returns Text with normalized line endings
 */
export function normalizeLineEndings(text: string): string {
  // Replace \r\n with \n (Windows)
  // Replace \r with \n (old Mac)
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Extract URLs from text using regex
 * 
 * @param text - Text content
 * @returns Array of detected URLs
 */
export function extractUrls(text: string): string[] {
  const urls: string[] = [];
  const matches = text.matchAll(URL_REGEX);

  for (const match of matches) {
    urls.push(match[0]);
  }

  // Remove duplicates
  return [...new Set(urls)];
}

/**
 * Detect if content is likely plain text (vs binary)
 * 
 * @param content - Content to check
 * @returns True if likely plain text
 */
export function isPlainText(content: string): boolean {
  // Check for null bytes (common in binary files)
  if (content.includes('\0')) {
    return false;
  }

  // Check for high ratio of printable characters
  const printableChars = content.match(/[\x20-\x7E\n\r\t]/g)?.length || 0;
  const totalChars = content.length;

  if (totalChars === 0) {
    return true;
  }

  const printableRatio = printableChars / totalChars;
  
  // If more than 80% printable, consider it text
  return printableRatio > 0.8;
}

/**
 * Extract text statistics
 * 
 * @param text - Text content
 * @returns Text statistics
 */
export function getTextStats(text: string): {
  lines: number;
  words: number;
  chars: number;
  urls: number;
} {
  const normalizedText = normalizeLineEndings(text);
  const lines = normalizedText.split('\n');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
  const urls = extractUrls(normalizedText);

  return {
    lines: lines.length,
    words: words.length,
    chars: normalizedText.length,
    urls: urls.length,
  };
}

/**
 * Truncate text to a maximum length
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

