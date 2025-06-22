
import { ValidationResult } from './types';
import { validationRules } from './rules';
import { validateFields } from './core';

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
  const fields: Record<string, { value: unknown; rules: any[] }> = {
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
