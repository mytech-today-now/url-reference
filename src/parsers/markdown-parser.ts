/**
 * Markdown Parser
 * Task: uur.1.6.0
 * 
 * Implements Markdown parsing using unified/remark to extract:
 * - Plain text content
 * - Frontmatter (YAML, TOML, JSON)
 * - Links (internal and external)
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import matter from 'gray-matter';
import { visit } from 'unist-util-visit';
import type { Root, Link } from 'mdast';

export interface MarkdownParseResult {
  /** Plain text content (without frontmatter) */
  text: string;
  /** Parsed frontmatter data */
  frontmatter: Record<string, any> | null;
  /** Extracted links */
  links: Array<{
    url: string;
    title?: string;
    text?: string;
  }>;
  /** Raw frontmatter string */
  rawFrontmatter?: string;
}

/**
 * Parse Markdown content and extract text, frontmatter, and links
 * 
 * @param content - Raw Markdown content
 * @returns Parsed Markdown data
 */
export async function parseMarkdown(content: string): Promise<MarkdownParseResult> {
  try {
    // Parse frontmatter using gray-matter (supports YAML, TOML, JSON)
    const { data: frontmatter, content: markdownContent, matter: rawFrontmatter } = matter(content);

    // Parse Markdown AST
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkStringify);

    const ast = processor.parse(markdownContent) as Root;

    // Extract links
    const links: Array<{ url: string; title?: string; text?: string }> = [];
    
    visit(ast, 'link', (node: Link) => {
      links.push({
        url: node.url,
        title: node.title || undefined,
        text: extractTextFromNode(node),
      });
    });

    // Extract plain text (remove all Markdown syntax)
    const text = extractPlainText(markdownContent);

    return {
      text,
      frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : null,
      links,
      rawFrontmatter: rawFrontmatter || undefined,
    };
  } catch (error) {
    // Handle malformed Markdown gracefully
    console.warn('Markdown parsing error:', error);
    
    // Fallback: return raw content as text
    return {
      text: content,
      frontmatter: null,
      links: [],
    };
  }
}

/**
 * Extract plain text from Markdown content (remove all syntax)
 * 
 * @param markdown - Markdown content
 * @returns Plain text
 */
function extractPlainText(markdown: string): string {
  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');

  // Remove headings markers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '');

  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Normalize whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * Extract text content from an AST node
 * 
 * @param node - AST node
 * @returns Text content
 */
function extractTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }

  if (node.children) {
    return node.children.map(extractTextFromNode).join('');
  }

  return '';
}

/**
 * Validate if content is valid Markdown
 * 
 * @param content - Content to validate
 * @returns True if valid Markdown
 */
export function isValidMarkdown(content: string): boolean {
  try {
    const processor = unified().use(remarkParse);
    processor.parse(content);
    return true;
  } catch {
    return false;
  }
}

