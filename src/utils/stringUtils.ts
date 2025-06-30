/**
 * Utility functions for string manipulation
 */

import DOMPurify from 'dompurify';

export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str: string): string => {
  if (!str) return str;
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const extractInitials = (name: string, maxInitials = 2): string => {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
};

export const pluralize = (word: string, count: number): string => {
  if (count === 1) return word;
  
  // Simple pluralization rules
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word.slice(-2, -1))) {
    return word.slice(0, -1) + 'ies';
  }
  return word + 's';
};

export const removeExtraSpaces = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

export const wordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const characterCount = (text: string, includeSpaces = true): number => {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
};

export const sentenceCount = (text: string): number => {
  return text.split(/[.!?]+/).filter(Boolean).length;
};

/**
 * Sanitizes a string to prevent XSS/injection vulnerabilities.
 * Removes script tags and encodes special characters.
 */
export const sanitizeString = (input: string): string => {
  if (!input) return "";
  // Remove script/style tags
  let sanitized = input.replace(/<\/?(script|style)[^>]*>/gi, "");
  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return sanitized;
};

/**
 * Sanitizes rich text HTML content to prevent XSS/injection vulnerabilities.
 * Uses DOMPurify to clean HTML while preserving formatting.
 * 
 * @param html - The HTML content to sanitize
 * @param allowedTags - Optional array of HTML tags to allow
 * @returns Sanitized HTML content
 */
export const sanitizeRichText = (html: string, allowedTags?: string[]): string => {
  if (!html) return "";
  
  const config = {
    ALLOWED_TAGS: allowedTags || [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img',
      'sup', 'sub'
    ],
    ALLOWED_ATTR: [
      'href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style',
      'rel', 'aria-label', 'title'
    ],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    WHOLE_DOCUMENT: false,
    SANITIZE_DOM: true
  };
  
  return DOMPurify.sanitize(html, config);
};

/**
 * Masks an API key for display, showing only the first and last 2 characters
 * @param apiKey The API key to mask
 * @returns Masked API key string
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return '';
  if (apiKey.length <= 4) return apiKey; // Too short to mask effectively
  
  const firstTwo = apiKey.substring(0, 2);
  const lastTwo = apiKey.substring(apiKey.length - 2);
  const middleAsterisks = '*'.repeat(apiKey.length - 4);
  
  return `${firstTwo}${middleAsterisks}${lastTwo}`;
};
