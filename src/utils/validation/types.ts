
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}
