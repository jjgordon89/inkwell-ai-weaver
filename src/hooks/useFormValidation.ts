
import { useState, useCallback } from 'react';
import { ValidationResult, ValidationRule, validateField } from '@/utils/validation';

interface FormField {
  value: unknown;
  rules: ValidationRule[];
  touched: boolean;
  error: string | null;
}

interface UseFormValidationReturn {
  fields: Record<string, FormField>;
  errors: Record<string, string | null>;
  isValid: boolean;
  hasErrors: boolean;
  setField: (name: string, value: unknown) => void;
  setFieldTouched: (name: string) => void;
  validateField: (name: string) => ValidationResult;
  validateAll: () => boolean;
  reset: () => void;
  getFieldError: (name: string) => string | null;
  isFieldInvalid: (name: string) => boolean;
}

export const useFormValidation = (
  initialFields: Record<string, { value: unknown; rules: ValidationRule[] }>
): UseFormValidationReturn => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initial: Record<string, FormField> = {};
    for (const [name, field] of Object.entries(initialFields)) {
      initial[name] = {
        value: field.value,
        rules: field.rules,
        touched: false,
        error: null
      };
    }
    return initial;
  });

  const setField = useCallback((name: string, value: unknown) => {
    setFields(prev => {
      const field = prev[name];
      if (!field) return prev;

      const validation = validateField(value, field.rules);
      
      return {
        ...prev,
        [name]: {
          ...field,
          value,
          error: validation.isValid ? null : validation.errors[0]
        }
      };
    });
  }, []);

  const setFieldTouched = useCallback((name: string) => {
    setFields(prev => {
      const field = prev[name];
      if (!field) return prev;

      return {
        ...prev,
        [name]: {
          ...field,
          touched: true
        }
      };
    });
  }, []);

  const validateFieldByName = useCallback((name: string): ValidationResult => {
    const field = fields[name];
    if (!field) {
      return { isValid: false, errors: ['Field not found'] };
    }

    return validateField(field.value, field.rules);
  }, [fields]);

  const validateAll = useCallback((): boolean => {
    let isFormValid = true;
    const newFields = { ...fields };

    for (const [name, field] of Object.entries(newFields)) {
      const validation = validateField(field.value, field.rules);
      newFields[name] = {
        ...field,
        touched: true,
        error: validation.isValid ? null : validation.errors[0]
      };

      if (!validation.isValid) {
        isFormValid = false;
      }
    }

    setFields(newFields);
    return isFormValid;
  }, [fields]);

  const reset = useCallback(() => {
    setFields(prev => {
      const reset: Record<string, FormField> = {};
      for (const [name, field] of Object.entries(prev)) {
        reset[name] = {
          ...field,
          touched: false,
          error: null
        };
      }
      return reset;
    });
  }, []);

  const getFieldError = useCallback((name: string): string | null => {
    const field = fields[name];
    return field?.touched ? field.error : null;
  }, [fields]);

  const isFieldInvalid = useCallback((name: string): boolean => {
    const field = fields[name];
    return Boolean(field?.touched && field.error);
  }, [fields]);

  const errors = Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [
      name,
      field.touched ? field.error : null
    ])
  );

  const isValid = Object.values(fields).every(field => !field.error);
  const hasErrors = Object.values(fields).some(field => field.touched && field.error);

  return {
    fields,
    errors,
    isValid,
    hasErrors,
    setField,
    setFieldTouched,
    validateField: validateFieldByName,
    validateAll,
    reset,
    getFieldError,
    isFieldInvalid
  };
};
