/**
 * JSON Schema definitions for URL Reference Mapper types
 * 
 * This module exports the JSON Schema for use in OpenSpec documents,
 * API documentation, and validation tools.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * JSON Schema for UrlMapping and related types
 * 
 * This schema can be referenced in OpenSpec documents or used for validation.
 * 
 * @example
 * ```typescript
 * import { UrlMappingSchema } from '@mytechtoday/url-reference-mapper';
 * 
 * // Use in validation
 * const Ajv = require('ajv');
 * const ajv = new Ajv();
 * const validate = ajv.compile(UrlMappingSchema.definitions.UrlMapping);
 * const valid = validate(myMapping);
 * ```
 * 
 * @example OpenSpec reference
 * ```yaml
 * # In an OpenSpec document
 * components:
 *   schemas:
 *     ArticleReference:
 *       allOf:
 *         - $ref: 'node_modules/@mytechtoday/url-reference-mapper/schema.json#/definitions/UrlMapping'
 *         - type: object
 *           properties:
 *             category:
 *               type: string
 * ```
 */
export const UrlMappingSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schema.json'), 'utf-8')
);

/**
 * Get the JSON Schema as a string
 * 
 * @returns JSON Schema as a formatted string
 */
export function getSchemaAsString(): string {
  return JSON.stringify(UrlMappingSchema, null, 2);
}

/**
 * Get a specific schema definition by name
 * 
 * @param definitionName - Name of the definition (e.g., 'UrlMapping', 'ValidationResult')
 * @returns The schema definition object
 * 
 * @example
 * ```typescript
 * import { getSchemaDefinition } from '@mytechtoday/url-reference-mapper';
 * 
 * const urlMappingSchema = getSchemaDefinition('UrlMapping');
 * console.log(urlMappingSchema.required); // ['title', 'url', 'localPath']
 * ```
 */
export function getSchemaDefinition(definitionName: string): any {
  if (!UrlMappingSchema.definitions || !UrlMappingSchema.definitions[definitionName]) {
    throw new Error(`Schema definition '${definitionName}' not found`);
  }
  return UrlMappingSchema.definitions[definitionName];
}

/**
 * List all available schema definitions
 * 
 * @returns Array of definition names
 */
export function listSchemaDefinitions(): string[] {
  return Object.keys(UrlMappingSchema.definitions || {});
}

