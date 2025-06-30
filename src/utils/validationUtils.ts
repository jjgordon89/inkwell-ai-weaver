/**
 * Form validation utilities for the application
 */
import { z } from 'zod';
import { sanitizeString } from './stringUtils';

/**
 * Basic project validation schema
 */
export const projectSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name cannot exceed 100 characters")
    .transform(sanitizeString),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .transform(val => val ? sanitizeString(val) : val),
  structure: z.enum(['novel', 'screenplay', 'research', 'poetry'])
    .default('novel'),
  wordCountTarget: z.number()
    .int("Word count target must be a whole number")
    .nonnegative("Word count target must be a positive number")
    .optional(),
  status: z.enum(['active', 'draft', 'revision', 'editing', 'complete', 'archived'])
    .default('draft')
});

/**
 * Document validation schema
 */
export const documentSchema = z.object({
  title: z.string()
    .min(1, "Document title is required")
    .max(200, "Title cannot exceed 200 characters")
    .transform(sanitizeString),
  type: z.enum([
    'folder', 'document', 'chapter', 'scene', 'character-sheet', 
    'research-note', 'timeline-event', 'setting-description', 
    'plot-point', 'dialogue', 'poem', 'stanza', 
    'screenplay-scene', 'act', 'sequence'
  ]),
  parentId: z.string().optional(),
  content: z.string().optional()
    .transform(val => val ? sanitizeString(val) : ''),
  synopsis: z.string().optional()
    .transform(val => val ? sanitizeString(val) : ''),
  status: z.enum([
    'not-started', 'draft', 'first-draft', 'revised', 
    'final', 'in-progress', 'needs-review', 'approved', 'on-hold'
  ]).default('not-started'),
  targetWordCount: z.number().optional(),
  labels: z.array(z.string()).default([])
});

/**
 * Validate input object against a schema with built-in sanitization
 * @param schema Zod schema to validate against
 * @param input Input data to validate
 * @returns Tuple of [validatedData, errors]
 */
export function validateAndSanitize<T extends z.ZodType>(
  schema: T,
  input: unknown
): [z.infer<T> | null, z.ZodError | null] {
  try {
    const validData = schema.parse(input);
    return [validData, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return [null, error];
    }
    // For unexpected errors, create a generic ZodError
    const genericError = new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: [],
        message: 'Validation failed due to an unexpected error'
      }
    ]);
    return [null, genericError];
  }
}

/**
 * Format Zod validation errors into a user-friendly object
 * @param error Zod validation error
 * @returns Object with field names as keys and error messages as values
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    formattedErrors[path || 'form'] = err.message;
  });
  
  return formattedErrors;
}
