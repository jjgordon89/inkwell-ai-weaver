
import { useState, useCallback, useMemo } from 'react';

interface ValidationRule {
  validator: (value: string) => boolean;
  message: string;
}

interface UseValidatedInputOptions {
  initialValue?: string;
  rules?: ValidationRule[];
  required?: boolean;
}

export const useValidatedInput = (options: UseValidatedInputOptions = {}) => {
  const { initialValue = '', rules = [], required = false } = options;
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const validationErrors: string[] = [];

    if (required && !value.trim()) {
      validationErrors.push('This field is required');
    }

    if (value.trim()) {
      rules.forEach(rule => {
        if (!rule.validator(value)) {
          validationErrors.push(rule.message);
        }
      });
    }

    return validationErrors;
  }, [value, rules, required]);

  const isValid = errors.length === 0;
  const showErrors = touched && errors.length > 0;

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    errors,
    isValid,
    showErrors,
    touched,
    onChange: handleChange,
    onBlur: handleBlur,
    reset
  };
};
