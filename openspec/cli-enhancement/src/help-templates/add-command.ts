/**
 * Help template for the 'add' command
 * This is an example template showing the structure and content
 * required for comprehensive help documentation.
 */

import { HelpTemplate } from '../types';

export const addCommandHelp: HelpTemplate = {
  command: 'add',
  
  description: 'Add a new URL mapping to the configuration',
  
  usage: 'url-ref add <url> <localPath> [options]',
  
  options: [
    {
      flags: '-e, --extract',
      description: 'Extract metadata from the document automatically',
      defaultValue: 'false'
    },
    {
      flags: '-t, --title <title>',
      description: 'Specify a custom title for the mapping',
      defaultValue: 'Extracted from document'
    },
    {
      flags: '-c, --config <path>',
      description: 'Path to configuration file',
      defaultValue: './url-mappings.json'
    },
    {
      flags: '--no-validate',
      description: 'Skip validation of the URL and file path',
      defaultValue: 'false'
    },
    {
      flags: '-h',
      description: 'Show brief help'
    },
    {
      flags: '--help',
      description: 'Show detailed help with examples'
    }
  ],
  
  examples: [
    '# Add a simple mapping',
    'url-ref add https://example.com/blog/post ./content/post.md',
    '',
    '# Add with metadata extraction',
    'url-ref add https://example.com/blog/post ./content/post.md --extract',
    '',
    '# Add with custom title',
    'url-ref add https://example.com/blog/post ./content/post.md --title "My Blog Post"',
    '',
    '# Add to custom config file',
    'url-ref add https://example.com/blog/post ./content/post.md --config ./my-config.json',
    '',
    '# Add without validation (faster)',
    'url-ref add https://example.com/blog/post ./content/post.md --no-validate'
  ],
  
  exitCodes: [
    {
      code: 0,
      description: 'Success - mapping added successfully'
    },
    {
      code: 1,
      description: 'Invalid arguments - missing required parameters or invalid options'
    },
    {
      code: 2,
      description: 'File not found - the specified local file does not exist'
    },
    {
      code: 3,
      description: 'Invalid URL - the URL format is invalid or unreachable'
    },
    {
      code: 4,
      description: 'Duplicate mapping - a mapping for this URL or path already exists'
    },
    {
      code: 5,
      description: 'Configuration error - unable to read or write configuration file'
    }
  ],
  
  relatedCommands: [
    'remove - Remove an existing URL mapping',
    'update - Update an existing URL mapping',
    'list - List all URL mappings',
    'validate - Validate all mappings in the configuration'
  ],
  
  notes: [
    'The URL must be a valid HTTP or HTTPS URL',
    'The local path can be absolute or relative to the current directory',
    'If --extract is used, the document will be parsed for metadata',
    'Metadata extraction supports Markdown, HTML, and plain text files',
    'Use --no-validate to skip URL and file validation for faster execution'
  ],
  
  seeAlso: [
    'For more information on metadata extraction, see: url-ref help extract',
    'For configuration file format, see: url-ref help config',
    'For validation rules, see: url-ref help validate'
  ]
};

/**
 * Example of how this template would be used:
 * 
 * ```typescript
 * import { HelpRenderer } from './help';
 * import { addCommandHelp } from './help-templates/add-command';
 * 
 * const renderer = new HelpRenderer();
 * 
 * // Full help
 * console.log(renderer.renderFull(addCommandHelp));
 * 
 * // Brief help
 * console.log(renderer.renderBrief(addCommandHelp));
 * ```
 * 
 * Expected output for full help:
 * 
 * ```
 * url-ref add - Add a new URL mapping to the configuration
 * 
 * Usage:
 *   url-ref add <url> <localPath> [options]
 * 
 * Options:
 *   -e, --extract              Extract metadata from the document automatically
 *   -t, --title <title>        Specify a custom title for the mapping
 *   -c, --config <path>        Path to configuration file (default: ./url-mappings.json)
 *   --no-validate              Skip validation of the URL and file path
 *   -h                         Show brief help
 *   --help                     Show detailed help with examples
 * 
 * Examples:
 *   # Add a simple mapping
 *   url-ref add https://example.com/blog/post ./content/post.md
 * 
 *   # Add with metadata extraction
 *   url-ref add https://example.com/blog/post ./content/post.md --extract
 * 
 *   # Add with custom title
 *   url-ref add https://example.com/blog/post ./content/post.md --title "My Blog Post"
 * 
 * Exit Codes:
 *   0  Success - mapping added successfully
 *   1  Invalid arguments - missing required parameters or invalid options
 *   2  File not found - the specified local file does not exist
 *   3  Invalid URL - the URL format is invalid or unreachable
 *   4  Duplicate mapping - a mapping for this URL or path already exists
 *   5  Configuration error - unable to read or write configuration file
 * 
 * Related Commands:
 *   remove - Remove an existing URL mapping
 *   update - Update an existing URL mapping
 *   list - List all URL mappings
 *   validate - Validate all mappings in the configuration
 * 
 * Notes:
 *   • The URL must be a valid HTTP or HTTPS URL
 *   • The local path can be absolute or relative to the current directory
 *   • If --extract is used, the document will be parsed for metadata
 *   • Metadata extraction supports Markdown, HTML, and plain text files
 * 
 * See Also:
 *   For more information on metadata extraction, see: url-ref help extract
 *   For configuration file format, see: url-ref help config
 * ```
 */

