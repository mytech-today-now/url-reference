import {
  UrlMappingSchema,
  getSchemaAsString,
  getSchemaDefinition,
  listSchemaDefinitions,
} from '../schema';

describe('Schema Module', () => {
  describe('UrlMappingSchema', () => {
    it('should load the schema correctly', () => {
      expect(UrlMappingSchema).toBeDefined();
      expect(UrlMappingSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(UrlMappingSchema.title).toBe('URL Reference Mapper Schema');
    });

    it('should have definitions object', () => {
      expect(UrlMappingSchema.definitions).toBeDefined();
      expect(typeof UrlMappingSchema.definitions).toBe('object');
    });

    it('should have UrlMapping definition', () => {
      expect(UrlMappingSchema.definitions.UrlMapping).toBeDefined();
      expect(UrlMappingSchema.definitions.UrlMapping.type).toBe('object');
      expect(UrlMappingSchema.definitions.UrlMapping.required).toEqual([
        'title',
        'url',
        'localPath',
      ]);
    });

    it('should have ValidationResult definition', () => {
      expect(UrlMappingSchema.definitions.ValidationResult).toBeDefined();
      expect(UrlMappingSchema.definitions.ValidationResult.type).toBe('object');
    });

    it('should have ValidationError definition', () => {
      expect(UrlMappingSchema.definitions.ValidationError).toBeDefined();
      expect(UrlMappingSchema.definitions.ValidationError.type).toBe('object');
    });

    it('should have ValidationWarning definition', () => {
      expect(UrlMappingSchema.definitions.ValidationWarning).toBeDefined();
      expect(UrlMappingSchema.definitions.ValidationWarning.type).toBe('object');
    });

    it('should have MapperConfig definition', () => {
      expect(UrlMappingSchema.definitions.MapperConfig).toBeDefined();
      expect(UrlMappingSchema.definitions.MapperConfig.type).toBe('object');
    });
  });

  describe('getSchemaAsString', () => {
    it('should return schema as formatted JSON string', () => {
      const schemaString = getSchemaAsString();
      expect(typeof schemaString).toBe('string');
      expect(schemaString.length).toBeGreaterThan(0);

      // Should be valid JSON
      const parsed = JSON.parse(schemaString);
      expect(parsed.$schema).toBe('http://json-schema.org/draft-07/schema#');
    });

    it('should be formatted with 2-space indentation', () => {
      const schemaString = getSchemaAsString();
      // Check for proper indentation
      expect(schemaString).toContain('  "$schema"');
    });
  });

  describe('getSchemaDefinition', () => {
    it('should retrieve UrlMapping definition', () => {
      const definition = getSchemaDefinition('UrlMapping');
      expect(definition).toBeDefined();
      expect(definition.type).toBe('object');
      expect(definition.required).toEqual(['title', 'url', 'localPath']);
    });

    it('should retrieve ValidationResult definition', () => {
      const definition = getSchemaDefinition('ValidationResult');
      expect(definition).toBeDefined();
      expect(definition.type).toBe('object');
      expect(definition.required).toEqual(['valid', 'errors', 'warnings']);
    });

    it('should retrieve ValidationError definition', () => {
      const definition = getSchemaDefinition('ValidationError');
      expect(definition).toBeDefined();
      expect(definition.type).toBe('object');
    });

    it('should retrieve ValidationWarning definition', () => {
      const definition = getSchemaDefinition('ValidationWarning');
      expect(definition).toBeDefined();
      expect(definition.type).toBe('object');
    });

    it('should retrieve MapperConfig definition', () => {
      const definition = getSchemaDefinition('MapperConfig');
      expect(definition).toBeDefined();
      expect(definition.type).toBe('object');
    });

    it('should throw error for non-existing definition', () => {
      expect(() => getSchemaDefinition('NonExistingDefinition')).toThrow(
        "Schema definition 'NonExistingDefinition' not found"
      );
    });
  });

  describe('listSchemaDefinitions', () => {
    it('should return array of definition names', () => {
      const definitions = listSchemaDefinitions();
      expect(Array.isArray(definitions)).toBe(true);
      expect(definitions.length).toBeGreaterThan(0);
    });

    it('should include all expected definitions', () => {
      const definitions = listSchemaDefinitions();
      expect(definitions).toContain('UrlMapping');
      expect(definitions).toContain('ValidationResult');
      expect(definitions).toContain('ValidationError');
      expect(definitions).toContain('ValidationWarning');
      expect(definitions).toContain('ValidationErrorType');
      expect(definitions).toContain('ValidationWarningType');
      expect(definitions).toContain('MapperConfig');
    });

    it('should return exactly 7 definitions', () => {
      const definitions = listSchemaDefinitions();
      expect(definitions.length).toBe(7);
    });
  });
});

