import { useState } from 'react';
import { z } from 'zod';
import { validateAndSanitize, formatZodErrors } from '@/utils/validationUtils';

interface FormField<T> {
  value: T;
  touched: boolean;
  error: string | null;
}

interface UseFormValidationOptions<T> {
  initialValues: Partial<T>;
  schema: z.ZodType<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormValidationReturn<T> {
  values: Partial<T>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isValid: boolean;
  hasErrors: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setTouched: <K extends keyof T>(field: K, isTouched?: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateAll: () => boolean;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>, onError?: (errors: Record<string, string>) => void) => (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  getFieldProps: <K extends keyof T>(field: K) => {
    name: string;
    value: T[K] | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    error: string | null;
    touched: boolean;
  };
}

export function useFormValidation<T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { initialValues, schema } = options;
  
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate a single field
  const validateField = <K extends keyof T>(field: K): boolean => {
    try {
      // Create a partial schema for this field if possible
      let fieldSchema: z.ZodType;
      
      // Try to create a partial schema, fall back to full schema if needed
      try {
        // Access schema shape if available (works with z.object schemas)
        if ('shape' in schema && typeof schema.shape === 'object') {
          const shape = schema.shape as Record<string, z.ZodTypeAny>;
          fieldSchema = z.object({ [field]: shape[field as string] }) as z.ZodType;
        } else {
          // Fall back to full schema
          fieldSchema = schema;
        }
      } catch (e) {
        // If we can't extract the field schema, use the full schema
        fieldSchema = schema;
      }
      
      const [validData, fieldError] = validateAndSanitize(fieldSchema, { [field]: values[field] });
      
      if (validData) {
        // Update with sanitized value if available
        if (field in validData) {
          setValues(prev => ({ ...prev, [field]: validData[field as string] }));
        }
        
        // Clear error for this field
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        
        return true;
      }
      
      if (fieldError) {
        const fieldErrors = formatZodErrors(fieldError);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(prev => ({ ...prev, [field as string]: fieldErrors[field as string] || null }));
          return false;
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = formatZodErrors(error);
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        return false;
      }
      
      // Handle unexpected errors
      setErrors(prev => ({ 
        ...prev, 
        [field as string]: error instanceof Error ? error.message : 'Validation error' 
      }));
      return false;
    }
    
    return true;
  };
  
  // Update a single field value
  const setValue = <K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when it's changed
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };
  
  // Mark a field as touched
  const setTouched = <K extends keyof T>(field: K, isTouched = true) => {
    setTouchedFields(prev => ({ ...prev, [field as string]: isTouched }));
  };
  
  // Handle field changes from inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name) {
      const fieldName = name as keyof T;
      
      // Handle different input types
      if (type === 'checkbox' && 'checked' in e.target) {
        setValue(fieldName, e.target.checked as T[typeof fieldName]);
      } else if (type === 'number') {
        setValue(fieldName, value === '' ? undefined as T[typeof fieldName] : Number(value) as T[typeof fieldName]);
      } else {
        setValue(fieldName, value as T[typeof fieldName]);
      }
    }
  };
  
  // Handle blur events
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    if (name) {
      setTouched(name as keyof T);
      
      // Validate just this field
      validateField(name as keyof T);
    }
  };
  
  // Validate all fields
  const validateAll = (): boolean => {
    const [validData, validationError] = validateAndSanitize(schema, values);
    
    if (validData) {
      setValues(validData as Partial<T>);
      setErrors({});
      return true;
    }
    
    if (validationError) {
      const formattedErrors = formatZodErrors(validationError);
      setErrors(formattedErrors);
      
      // Mark all fields with errors as touched
      const errorFields = Object.keys(formattedErrors);
      const newTouched = { ...touched };
      errorFields.forEach(field => {
        if (field !== 'form') {
          newTouched[field] = true;
        }
      });
      setTouchedFields(newTouched);
      
      return false;
    }
    
    return true;
  };
  
  // Get computed properties for isValid and hasErrors
  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;
  
  // Handle form submission
  const handleSubmit = (
    onSubmit: (data: T) => void | Promise<void>,
    onError?: (errors: Record<string, string>) => void
  ) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      setIsSubmitting(true);
      
      try {
        const isValid = validateAll();
        
        if (isValid) {
          await onSubmit(values as T);
        } else if (onError) {
          // Filter out null values from errors
          const nonNullErrors = Object.entries(errors)
            .reduce((acc, [key, value]) => {
              if (value !== null) acc[key] = value;
              return acc;
            }, {} as Record<string, string>);
          
          onError(nonNullErrors);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors(prev => ({
          ...prev,
          form: error instanceof Error ? error.message : 'An unexpected error occurred'
        }));
        
        if (onError) {
          onError({ form: error instanceof Error ? error.message : 'An unexpected error occurred' });
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  };
  
  // Reset the form
  const reset = (newValues: Partial<T> = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouchedFields({});
    setIsSubmitting(false);
  };
  
  // Utility to get all props for a field
  const getFieldProps = <K extends keyof T>(field: K) => {
    return {
      name: field as string,
      value: values[field],
      onChange: handleChange,
      onBlur: handleBlur,
      error: errors[field as string] || null,
      touched: !!touched[field as string]
    };
  };
  
  return {
    values,
    errors,
    touched,
    isValid,
    hasErrors,
    isSubmitting,
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    getFieldProps
  };
}
