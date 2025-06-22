
import { ValidationResult, ValidationRule } from './types';

// Generic validator function
export function validateField<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate multiple fields
export function validateFields(fields: Record<string, { value: unknown; rules: ValidationRule[] }>): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, { value, rules }] of Object.entries(fields)) {
    results[fieldName] = validateField(value, rules);
  }

  return results;
}
