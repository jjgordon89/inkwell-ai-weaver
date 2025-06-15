
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

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
  })
};

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
export function validateFields(fields: Record<string, { value: any; rules: ValidationRule[] }>): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, { value, rules }] of Object.entries(fields)) {
    results[fieldName] = validateField(value, rules);
  }

  return results;
}

// Character validation
export function validateCharacterInput(data: {
  name: string;
  age?: string;
  occupation?: string;
  description: string;
  personality?: string;
  backstory?: string;
  appearance?: string;
}): ValidationResult {
  const fields = {
    name: {
      value: data.name,
      rules: [
        validationRules.required('Character name is required'),
        validationRules.minLength(2, 'Name must be at least 2 characters'),
        validationRules.maxLength(100, 'Name must be no more than 100 characters')
      ]
    },
    description: {
      value: data.description,
      rules: [
        validationRules.required('Character description is required'),
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(2000, 'Description must be no more than 2000 characters')
      ]
    }
  };

  if (data.age) {
    fields.age = {
      value: data.age,
      rules: [
        validationRules.number('Age must be a valid number'),
        validationRules.range(0, 200, 'Age must be between 0 and 200')
      ]
    };
  }

  if (data.occupation) {
    fields.occupation = {
      value: data.occupation,
      rules: [
        validationRules.maxLength(100, 'Occupation must be no more than 100 characters')
      ]
    };
  }

  if (data.personality) {
    fields.personality = {
      value: data.personality,
      rules: [
        validationRules.maxLength(1000, 'Personality description must be no more than 1000 characters')
      ]
    };
  }

  if (data.backstory) {
    fields.backstory = {
      value: data.backstory,
      rules: [
        validationRules.maxLength(2000, 'Backstory must be no more than 2000 characters')
      ]
    };
  }

  if (data.appearance) {
    fields.appearance = {
      value: data.appearance,
      rules: [
        validationRules.maxLength(1000, 'Appearance description must be no more than 1000 characters')
      ]
    };
  }

  const results = validateFields(fields);
  const allErrors = Object.values(results).flatMap(result => result.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Story arc validation
export function validateStoryArcInput(data: {
  title: string;
  description: string;
}): ValidationResult {
  const fields = {
    title: {
      value: data.title,
      rules: [
        validationRules.required('Story arc title is required'),
        validationRules.minLength(3, 'Title must be at least 3 characters'),
        validationRules.maxLength(200, 'Title must be no more than 200 characters')
      ]
    },
    description: {
      value: data.description,
      rules: [
        validationRules.required('Story arc description is required'),
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(3000, 'Description must be no more than 3000 characters')
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

// World element validation
export function validateWorldElementInput(data: {
  name: string;
  description: string;
  type: string;
}): ValidationResult {
  const validTypes = ['location', 'organization', 'concept'];

  const fields = {
    name: {
      value: data.name,
      rules: [
        validationRules.required('Element name is required'),
        validationRules.minLength(2, 'Name must be at least 2 characters'),
        validationRules.maxLength(100, 'Name must be no more than 100 characters')
      ]
    },
    description: {
      value: data.description,
      rules: [
        validationRules.required('Element description is required'),
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(2000, 'Description must be no more than 2000 characters')
      ]
    },
    type: {
      value: data.type,
      rules: [
        {
          validate: (value: string) => validTypes.includes(value),
          message: 'Invalid element type'
        }
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
