import * as https from 'https';
import * as http from 'http';
import { ValidationResult, ValidationError, ValidationWarning } from '../types';

/**
 * Configuration options for URL validation
 */
export interface UrlValidatorConfig {
  /** Whether to check URL accessibility via HTTP HEAD request */
  checkAccessibility?: boolean;
  /** Timeout for accessibility check in milliseconds (default: 5000) */
  timeout?: number;
  /** Allowed protocols (default: ['http:', 'https:']) */
  allowedProtocols?: string[];
}

/**
 * Validator for URL format and accessibility
 */
export class UrlValidator {
  private config: Required<UrlValidatorConfig>;

  constructor(config: UrlValidatorConfig = {}) {
    this.config = {
      checkAccessibility: config.checkAccessibility ?? false,
      timeout: config.timeout ?? 5000,
      allowedProtocols: config.allowedProtocols ?? ['http:', 'https:'],
    };
  }

  /**
   * Validate a URL
   * 
   * @param url - URL to validate
   * @returns Validation result with errors and warnings
   */
  async validate(url: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if URL is empty or null
    if (!url || url.trim() === '') {
      errors.push({
        type: 'invalid_url',
        message: 'URL cannot be empty',
      });
      return { valid: false, errors, warnings };
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      errors.push({
        type: 'invalid_url',
        message: `Invalid URL format: ${url}`,
      });
      return { valid: false, errors, warnings };
    }

    // Check protocol
    if (!this.config.allowedProtocols.includes(parsedUrl.protocol)) {
      errors.push({
        type: 'invalid_url',
        message: `Invalid protocol: ${parsedUrl.protocol}. Allowed protocols: ${this.config.allowedProtocols.join(', ')}`,
      });
    }

    // Check accessibility if enabled
    if (this.config.checkAccessibility && errors.length === 0) {
      const accessibilityResult = await this.checkUrlAccessibility(url);
      if (accessibilityResult.error) {
        warnings.push({
          type: 'missing_file',
          message: `URL accessibility check failed: ${accessibilityResult.error}`,
        });
      } else if (accessibilityResult.statusCode && accessibilityResult.statusCode >= 400) {
        warnings.push({
          type: 'missing_file',
          message: `URL returned status ${accessibilityResult.statusCode}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a URL is accessible via HTTP HEAD request
   * 
   * @param url - URL to check
   * @returns Object with statusCode or error
   */
  private async checkUrlAccessibility(url: string): Promise<{ statusCode?: number; error?: string }> {
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const request = protocol.request(
          url,
          {
            method: 'HEAD',
            timeout: this.config.timeout,
          },
          (response) => {
            resolve({ statusCode: response.statusCode });
          }
        );

        request.on('error', (error) => {
          resolve({ error: error.message });
        });

        request.on('timeout', () => {
          request.destroy();
          resolve({ error: `Request timeout after ${this.config.timeout}ms` });
        });

        request.end();
      } catch (error) {
        resolve({ error: (error as Error).message });
      }
    });
  }

  /**
   * Validate multiple URLs in parallel
   * 
   * @param urls - Array of URLs to validate
   * @returns Array of validation results
   */
  async validateBatch(urls: string[]): Promise<Array<{ url: string; result: ValidationResult }>> {
    const results = await Promise.all(
      urls.map(async (url) => ({
        url,
        result: await this.validate(url),
      }))
    );
    return results;
  }
}

