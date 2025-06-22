
import { ValidationResult, ValidationRule } from './types';
import { validationRules } from './rules';
import { validateField } from './core';

// API key validation
export function validateApiKey(apiKey: string, providerName: string): ValidationResult {
  const trimmed = apiKey.trim();

  const baseRules = [
    validationRules.required(`${providerName} API key is required`),
    validationRules.minLength(10, 'API key is too short')
  ];

  // Provider-specific validation
  const providerRules: Record<string, ValidationRule<string>[]> = {
    'OpenAI': [
      {
        validate: (value: string) => value.startsWith('sk-'),
        message: 'OpenAI API key must start with "sk-"'
      }
    ],
    'Google Gemini': [
      {
        validate: (value: string) => /^[a-zA-Z0-9_-]+$/.test(value),
        message: 'Invalid Google API key format'
      }
    ],
    'Groq': [
      {
        validate: (value: string) => value.startsWith('gsk_'),
        message: 'Groq API key must start with "gsk_"'
      }
    ]
  };

  const rules = [...baseRules, ...(providerRules[providerName] || [])];
  return validateField(trimmed, rules);
}

// AI response validation
export function validateAIResponse(response: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof response !== 'string') {
    errors.push('AI response must be a string');
    return { isValid: false, errors };
  }

  if (response.trim().length === 0) {
    errors.push('AI response cannot be empty');
  }

  if (response.length > 10000) {
    errors.push('AI response is too long');
  }

  // Check for common error patterns
  if (response.toLowerCase().includes('error') && response.length < 100) {
    errors.push('AI response appears to be an error message');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
