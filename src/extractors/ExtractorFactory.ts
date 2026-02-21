/**
 * Extractor Factory
 * Task: uur-1-5-btl (hel.2.1)
 * 
 * Factory pattern for selecting the correct extractor based on file extension.
 * Supports Markdown, HTML, and plain text files.
 */

import * as path from 'path';
import { BaseExtractor } from './BaseExtractor';
import { MarkdownExtractor } from './MarkdownExtractor';
import { HtmlExtractor } from './HtmlExtractor';
import { TextExtractor } from './TextExtractor';
import { ExtractionConfig } from '../extractors';

/**
 * Supported file formats for extraction
 */
export enum FileFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  TEXT = 'text',
  UNKNOWN = 'unknown',
}

/**
 * Factory class for creating appropriate extractors
 */
export class ExtractorFactory {
  /**
   * Detect file format from file extension
   * 
   * @param filePath - Path to the file
   * @returns Detected file format
   */
  static detectFormat(filePath: string): FileFormat {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.md':
      case '.markdown':
        return FileFormat.MARKDOWN;
      
      case '.html':
      case '.htm':
        return FileFormat.HTML;
      
      case '.txt':
        return FileFormat.TEXT;
      
      default:
        return FileFormat.UNKNOWN;
    }
  }

  /**
   * Create an extractor for the given file
   * 
   * @param filePath - Path to the file
   * @param config - Optional extraction configuration
   * @returns Appropriate extractor instance
   */
  static createExtractor(filePath: string, config?: ExtractionConfig): BaseExtractor {
    const format = this.detectFormat(filePath);
    return this.createExtractorForFormat(format, config);
  }

  /**
   * Create an extractor for a specific format
   * 
   * @param format - File format
   * @param config - Optional extraction configuration
   * @returns Appropriate extractor instance
   */
  static createExtractorForFormat(format: FileFormat, config?: ExtractionConfig): BaseExtractor {
    switch (format) {
      case FileFormat.MARKDOWN:
        return new MarkdownExtractor(config);
      
      case FileFormat.HTML:
        return new HtmlExtractor(config);
      
      case FileFormat.TEXT:
      case FileFormat.UNKNOWN:
      default:
        // Default to text extractor for unknown formats
        return new TextExtractor(config);
    }
  }

  /**
   * Get all supported file extensions
   * 
   * @returns Array of supported extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.md', '.markdown', '.html', '.htm', '.txt'];
  }

  /**
   * Check if a file extension is supported
   * 
   * @param filePath - Path to the file
   * @returns True if supported, false otherwise
   */
  static isSupported(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.getSupportedExtensions().includes(ext);
  }
}

