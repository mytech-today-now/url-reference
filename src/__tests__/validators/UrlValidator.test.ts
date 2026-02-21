import { UrlValidator } from '../../validators/UrlValidator';

describe('UrlValidator', () => {
  describe('Format Validation', () => {
    it('should validate a valid HTTP URL', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('http://example.com');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid HTTPS URL', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('https://example.com/path/to/page');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject an empty URL', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_url');
      expect(result.errors[0].message).toContain('cannot be empty');
    });

    it('should reject an invalid URL format', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('not-a-url');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_url');
      expect(result.errors[0].message).toContain('Invalid URL format');
    });

    it('should reject FTP protocol by default', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('ftp://example.com/file.txt');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_url');
      expect(result.errors[0].message).toContain('Invalid protocol');
    });

    it('should reject file:// protocol by default', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('file:///path/to/file');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_url');
      expect(result.errors[0].message).toContain('Invalid protocol');
    });

    it('should allow custom protocols', async () => {
      const validator = new UrlValidator({
        allowedProtocols: ['http:', 'https:', 'ftp:'],
      });
      const result = await validator.validate('ftp://example.com/file.txt');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Accessibility Check', () => {
    it('should skip accessibility check by default', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('https://example.com');
      
      expect(result.warnings).toHaveLength(0);
    });

    it('should check accessibility when enabled', async () => {
      const validator = new UrlValidator({
        checkAccessibility: true,
        timeout: 5000,
      });
      
      // Using a real URL that should be accessible
      const result = await validator.validate('https://www.google.com');
      
      // Should either succeed or have a warning (depending on network)
      expect(result.errors).toHaveLength(0);
    }, 10000); // Increase timeout for network request

    it('should handle timeout configuration', async () => {
      const validator = new UrlValidator({
        checkAccessibility: true,
        timeout: 1, // Very short timeout
      });
      
      const result = await validator.validate('https://example.com');
      
      // Should have a warning about timeout or accessibility
      expect(result.errors).toHaveLength(0);
    }, 10000);
  });

  describe('Batch Validation', () => {
    it('should validate multiple URLs', async () => {
      const validator = new UrlValidator();
      const urls = [
        'https://example.com',
        'http://test.com',
        'invalid-url',
        'ftp://example.com',
      ];
      
      const results = await validator.validateBatch(urls);
      
      expect(results).toHaveLength(4);
      expect(results[0].result.valid).toBe(true);
      expect(results[1].result.valid).toBe(true);
      expect(results[2].result.valid).toBe(false);
      expect(results[3].result.valid).toBe(false);
    });

    it('should return results in the same order', async () => {
      const validator = new UrlValidator();
      const urls = [
        'https://first.com',
        'https://second.com',
        'https://third.com',
      ];
      
      const results = await validator.validateBatch(urls);
      
      expect(results[0].url).toBe('https://first.com');
      expect(results[1].url).toBe('https://second.com');
      expect(results[2].url).toBe('https://third.com');
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with query parameters', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('https://example.com/page?param=value&other=123');
      
      expect(result.valid).toBe(true);
    });

    it('should handle URLs with fragments', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('https://example.com/page#section');
      
      expect(result.valid).toBe(true);
    });

    it('should handle URLs with authentication', async () => {
      const validator = new UrlValidator();
      const result = await validator.validate('https://user:pass@example.com');
      
      expect(result.valid).toBe(true);
    });
  });
});

