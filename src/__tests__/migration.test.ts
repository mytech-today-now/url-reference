/**
 * Migration Utilities Tests
 * Task: uur-1-5-m6u (hel.1.2)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  isV1Config,
  migrateMappingV1ToV2,
  migrateV1ToV2,
  createBackup,
  migrateConfigFile,
  autoMigrateConfig,
  cleanupOldBackups,
} from '../utils/migration';

describe('Migration Utilities', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migration-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('isV1Config', () => {
    it('should detect v1.0 config without version field', () => {
      const config = {
        mappings: [],
      };
      expect(isV1Config(config)).toBe(true);
    });

    it('should detect v1.0 config with version 1.0.0', () => {
      const config = {
        version: '1.0.0',
        mappings: [],
      };
      expect(isV1Config(config)).toBe(true);
    });

    it('should detect v2.0 config', () => {
      const config = {
        version: '2.0.0',
        mappings: [],
      };
      expect(isV1Config(config)).toBe(false);
    });
  });

  describe('migrateMappingV1ToV2', () => {
    it('should migrate basic mapping', () => {
      const v1Mapping = {
        title: 'Test',
        url: 'https://example.com',
        localPath: './test.md',
      };

      const v2Mapping = migrateMappingV1ToV2(v1Mapping);

      expect(v2Mapping.title).toBe('Test');
      expect(v2Mapping.url).toBe('https://example.com');
      expect(v2Mapping.localPath).toBe('./test.md');
      expect(v2Mapping.lastUpdated).toBeDefined();
    });

    it('should preserve existing lastUpdated', () => {
      const timestamp = '2026-01-01T00:00:00.000Z';
      const v1Mapping = {
        title: 'Test',
        url: 'https://example.com',
        localPath: './test.md',
        lastUpdated: timestamp,
      };

      const v2Mapping = migrateMappingV1ToV2(v1Mapping);

      expect(v2Mapping.lastUpdated).toBe(timestamp);
    });

    it('should extract metadata properties to specific fields', () => {
      const v1Mapping = {
        title: 'Test',
        url: 'https://example.com',
        localPath: './test.md',
        metadata: {
          wordCount: 500,
          readingTime: 3,
          tags: 'test, migration',
          author: 'John Doe',
        },
      };

      const v2Mapping = migrateMappingV1ToV2(v1Mapping);

      expect(v2Mapping.wordCount).toBe(500);
      expect(v2Mapping.readingTime).toBe(3);
      expect(v2Mapping.tags).toBe('test, migration');
      expect(v2Mapping.author).toBe('John Doe');
      expect(v2Mapping.metadata).toBeUndefined();
    });

    it('should preserve unknown metadata properties', () => {
      const v1Mapping = {
        title: 'Test',
        url: 'https://example.com',
        localPath: './test.md',
        metadata: {
          wordCount: 500,
          customField: 'custom value',
          anotherField: 123,
        },
      };

      const v2Mapping = migrateMappingV1ToV2(v1Mapping);

      expect(v2Mapping.wordCount).toBe(500);
      expect(v2Mapping.metadata).toEqual({
        customField: 'custom value',
        anotherField: 123,
      });
    });
  });

  describe('migrateV1ToV2', () => {
    it('should migrate complete v1.0 config', () => {
      const v1Config = {
        mappings: [
          {
            title: 'Test 1',
            url: 'https://example.com/1',
            localPath: './test1.md',
          },
          {
            title: 'Test 2',
            url: 'https://example.com/2',
            localPath: './test2.md',
          },
        ],
      };

      const v2Config = migrateV1ToV2(v1Config);

      expect(v2Config.version).toBe('2.0.0');
      expect(v2Config.mappings).toHaveLength(2);
      expect(v2Config.metadata?.createdAt).toBeDefined();
      expect(v2Config.metadata?.updatedAt).toBeDefined();
    });
  });

  describe('createBackup', () => {
    it('should create backup file', () => {
      const configPath = path.join(tempDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify({ test: 'data' }));

      const backupDir = path.join(tempDir, 'backups');
      const backupPath = createBackup(configPath, backupDir);

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(backupPath).toContain('backup');
    });

    it('should throw error for non-existent file', () => {
      expect(() => createBackup('/non/existent/file.json')).toThrow('File not found');
    });

    it('should create backup directory if it does not exist', () => {
      const configPath = path.join(tempDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify({ test: 'data' }));

      const backupDir = path.join(tempDir, 'new-backups');
      createBackup(configPath, backupDir);

      expect(fs.existsSync(backupDir)).toBe(true);
    });
  });

  describe('migrateConfigFile', () => {
    it('should migrate config file successfully', () => {
      const inputPath = path.join(tempDir, 'v1-config.json');
      const outputPath = path.join(tempDir, 'v2-config.json');

      const v1Config = {
        mappings: [
          {
            title: 'Test',
            url: 'https://example.com',
            localPath: './test.md',
          },
        ],
      };

      fs.writeFileSync(inputPath, JSON.stringify(v1Config));

      const result = migrateConfigFile(inputPath, outputPath, { backup: false });

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(fs.existsSync(outputPath)).toBe(true);

      const v2Config = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      expect(v2Config.version).toBe('2.0.0');
    });

    it('should create backup when requested', () => {
      const inputPath = path.join(tempDir, 'v1-config.json');
      const outputPath = path.join(tempDir, 'v2-config.json');
      const backupDir = path.join(tempDir, 'backups');

      const v1Config = {
        mappings: [
          {
            title: 'Test',
            url: 'https://example.com',
            localPath: './test.md',
          },
        ],
      };

      fs.writeFileSync(inputPath, JSON.stringify(v1Config));

      const result = migrateConfigFile(inputPath, outputPath, {
        backup: true,
        backupDir,
      });

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(fs.existsSync(result.backupPath!)).toBe(true);
    });

    it('should handle already migrated config', () => {
      const inputPath = path.join(tempDir, 'v2-config.json');
      const outputPath = path.join(tempDir, 'v2-output.json');

      const v2Config = {
        version: '2.0.0',
        mappings: [],
      };

      fs.writeFileSync(inputPath, JSON.stringify(v2Config));

      const result = migrateConfigFile(inputPath, outputPath, { backup: false });

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Configuration is already v2.0 format');
    });

    it('should handle invalid JSON', () => {
      const inputPath = path.join(tempDir, 'invalid.json');
      const outputPath = path.join(tempDir, 'output.json');

      fs.writeFileSync(inputPath, 'invalid json content');

      const result = migrateConfigFile(inputPath, outputPath, { backup: false });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('autoMigrateConfig', () => {
    it('should migrate v1.0 config', () => {
      const v1Config = {
        mappings: [
          {
            title: 'Test',
            url: 'https://example.com',
            localPath: './test.md',
          },
        ],
      };

      const result = autoMigrateConfig(v1Config);

      expect(result.version).toBe('2.0.0');
    });

    it('should not migrate v2.0 config', () => {
      const v2Config = {
        version: '2.0.0',
        mappings: [],
      };

      const result = autoMigrateConfig(v2Config);

      expect(result).toBe(v2Config);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should keep only the most recent backups', () => {
      const backupDir = path.join(tempDir, 'backups');
      fs.mkdirSync(backupDir);

      // Create 10 backup files with different timestamps
      for (let i = 0; i < 10; i++) {
        const filename = `config-backup-2026-01-0${i + 1}T00-00-00.json`;
        const filePath = path.join(backupDir, filename);
        fs.writeFileSync(filePath, JSON.stringify({ backup: i }));

        // Set different modification times
        const time = new Date(2026, 0, i + 1);
        fs.utimesSync(filePath, time, time);
      }

      cleanupOldBackups(backupDir, 5);

      const remainingFiles = fs.readdirSync(backupDir);
      expect(remainingFiles.length).toBe(5);
    });

    it('should handle non-existent backup directory', () => {
      expect(() => cleanupOldBackups('/non/existent/dir')).not.toThrow();
    });
  });
});
