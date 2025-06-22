
import { ValidationRule } from './types';
import { wordCount } from '../stringUtils';
import { isEmpty } from '../objectUtils';

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule<string> => ({
    validate: (value: string) => Boolean(value && value.trim().length > 0),
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),

  minWords: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => wordCount(value) >= min,
    message: message || `Must be at least ${min} words`
  }),

  maxWords: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => wordCount(value) <= max,
    message: message || `Must be no more than ${max} words`
  }),

  email: (message = 'Invalid email format'): ValidationRule<string> => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  number: (message = 'Must be a valid number'): ValidationRule<string | number> => ({
    validate: (value: string | number) => !isNaN(Number(value)),
    message
  }),

  positiveNumber: (message = 'Must be a positive number'): ValidationRule<string | number> => ({
    validate: (value: string | number) => !isNaN(Number(value)) && Number(value) > 0,
    message
  }),

  range: (min: number, max: number, message?: string): ValidationRule<string | number> => ({
    validate: (value: string | number) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `Must be between ${min} and ${max}`
  }),

  noSpecialChars: (message = 'Special characters are not allowed'): ValidationRule<string> => ({
    validate: (value: string) => /^[a-zA-Z0-9\s-_]+$/.test(value),
    message
  }),

  apiKey: (message = 'Invalid API key format'): ValidationRule<string> => ({
    validate: (value: string) => {
      const trimmed = value.trim();
      return trimmed.length >= 10 && /^[a-zA-Z0-9\-_]+$/.test(trimmed);
    },
    message
  }),

  notEmpty: (message = 'Cannot be empty'): ValidationRule<any> => ({
    validate: (value: any) => !isEmpty(value),
    message
  })
};
