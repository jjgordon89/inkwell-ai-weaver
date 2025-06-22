
import { ValidationResult } from './types';
import { validationRules } from './rules';
import { validateFields } from './core';

// Document content validation
export function validateDocumentContent(content: string, title: string): ValidationResult {
  const fields = {
    title: {
      value: title,
      rules: [
        validationRules.required('Document title is required'),
        validationRules.minLength(1, 'Title cannot be empty'),
        validationRules.maxLength(200, 'Title must be no more than 200 characters')
      ]
    },
    content: {
      value: content,
      rules: [
        validationRules.maxLength(1000000, 'Document content is too large')
      ]
    }
  };

  const results = validateFields(fields);
  const allErrors = Object.values(results).flatMap(result => result.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
