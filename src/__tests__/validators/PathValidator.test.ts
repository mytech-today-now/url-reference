import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PathValidator } from '../../validators/PathValidator';

describe('PathValidator', () => {
  let tempDir: string;
  let testFile: string;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'path-validator-test-'));
    testFile = path.join(tempDir, 'test.md');
    fs.writeFileSync(testFile, '# Test File\n\nThis is a test file.');
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Format Validation', () => {
    it('should validate an existing file', () => {
      const validator = new PathValidator();
      const result = validator.validate(testFile);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject an empty path', () => {
      const validator = new PathValidator();
      const result = validator.validate('');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_format');
      expect(result.errors[0].message).toContain('cannot be empty');
    });

    it('should warn about relative paths', () => {
      const validator = new PathValidator();
      const result = validator.validate('./relative/path.md');
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].type).toBe('relative_path');
    });

    it('should enforce absolute paths when required', () => {
      const validator = new PathValidator({ requireAbsolute: true });
      const result = validator.validate('./relative/path.md');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_format');
      expect(result.errors[0].message).toContain('must be absolute');
    });
  });

  describe('File Existence', () => {
    it('should warn when file does not exist', () => {
      const validator = new PathValidator();
      const nonExistentPath = path.join(tempDir, 'nonexistent.md');
      const result = validator.validate(nonExistentPath);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].type).toBe('missing_file');
      expect(result.warnings[0].message).toContain('not found');
    });

    it('should reject directories', () => {
      const validator = new PathValidator();
      const result = validator.validate(tempDir);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_format');
      expect(result.errors[0].message).toContain('not a file');
    });
  });

  describe('File Type Validation', () => {
    it('should accept allowed file extensions', () => {
      const validator = new PathValidator();
      const mdFile = path.join(tempDir, 'test.md');
      fs.writeFileSync(mdFile, 'content');
      
      const result = validator.validate(mdFile);
      
      expect(result.valid).toBe(true);
    });

    it('should reject disallowed file extensions', () => {
      const validator = new PathValidator();
      const pdfFile = path.join(tempDir, 'test.pdf');
      fs.writeFileSync(pdfFile, 'content');
      
      const result = validator.validate(pdfFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_format');
      expect(result.errors[0].message).toContain('Invalid file type');
    });

    it('should allow custom file extensions', () => {
      const validator = new PathValidator({
        allowedExtensions: ['.pdf', '.docx'],
      });
      const pdfFile = path.join(tempDir, 'test.pdf');
      fs.writeFileSync(pdfFile, 'content');
      
      const result = validator.validate(pdfFile);
      
      expect(result.valid).toBe(true);
    });

    it('should handle case-insensitive extensions', () => {
      const validator = new PathValidator();
      const mdFile = path.join(tempDir, 'test.MD');
      fs.writeFileSync(mdFile, 'content');
      
      const result = validator.validate(mdFile);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should detect path traversal attempts', () => {
      const validator = new PathValidator({ basePath: tempDir });
      const traversalPath = path.join(tempDir, '..', '..', 'etc', 'passwd');
      
      const result = validator.validate(traversalPath);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_format');
      expect(result.errors[0].message).toContain('Path traversal detected');
    });

    it('should allow paths within base directory', () => {
      const validator = new PathValidator({ basePath: tempDir });
      const validPath = path.join(tempDir, 'subdir', 'file.md');
      
      // Create the subdirectory and file
      const subdir = path.join(tempDir, 'subdir');
      fs.mkdirSync(subdir);
      fs.writeFileSync(validPath, 'content');
      
      const result = validator.validate(validPath);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple paths', () => {
      const validator = new PathValidator();
      const file1 = path.join(tempDir, 'file1.md');
      const file2 = path.join(tempDir, 'file2.html');
      fs.writeFileSync(file1, 'content');
      fs.writeFileSync(file2, 'content');
      
      const paths = [file1, file2, 'nonexistent.md'];
      const results = validator.validateBatch(paths);
      
      expect(results).toHaveLength(3);
      expect(results[0].result.valid).toBe(true);
      expect(results[1].result.valid).toBe(true);
      expect(results[2].result.warnings.length).toBeGreaterThan(0);
    });
  });
});

