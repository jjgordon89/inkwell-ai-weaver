/**
 * Utility functions for string manipulation
 */

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
 * Sanitizes a string to prevent XSS/injection attacks.
 * Removes or escapes HTML tags and dangerous characters.
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  // Remove script/style tags and escape angle brackets
  return input
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/<style.*?>.*?<\/style>/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/\$/g, '&#36;')
    .replace(/\(/g, '&#40;')
    .replace(/\)/g, '&#41;')
    .replace(/=/g, '&#61;');
}
