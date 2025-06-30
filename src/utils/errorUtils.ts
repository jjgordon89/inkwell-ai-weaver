
/**
 * Utility functions for error handling
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
  type?: ErrorType;
}

/**
 * Types of errors that can occur in the application
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
  AI_SERVICE = 'ai_service',
  TIMEOUT = 'timeout'
}

/**
 * Categorizes an error based on its type or message
 */
export const categorizeError = (input: unknown): ErrorType => {
  const message = typeof input === 'string' 
    ? input.toLowerCase() 
    : formatError(input).toLowerCase();
  
  if (message.includes('timeout') || message.includes('timed out')) {
    return ErrorType.TIMEOUT;
  }
  
  if (message.includes('network') || message.includes('connection') || message.includes('offline')) {
    return ErrorType.NETWORK;
  }
  
  if (message.includes('auth') || message.includes('login') || message.includes('credential')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('permission') || message.includes('access') || message.includes('forbidden')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (message.includes('valid') || message.includes('input') || message.includes('required')) {
    return ErrorType.VALIDATION;
  }
  
  if (message.includes('database') || message.includes('sql') || message.includes('db')) {
    return ErrorType.DATABASE;
  }
  
  if (message.includes('ai') || message.includes('model') || message.includes('token')) {
    return ErrorType.AI_SERVICE;
  }
  
  return ErrorType.UNKNOWN;
};

export const createError = (message: string, code?: string, details?: unknown): ErrorInfo => {
  const error: ErrorInfo = {
    message,
    code,
    details,
    timestamp: new Date()
  };
  
  // Categorize the error based on the message
  error.type = categorizeError(message);
  
  return error;
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if (errorObj.error) {
      return typeof errorObj.error === 'string' ? errorObj.error : JSON.stringify(errorObj.error);
    }
  }
  
  return 'An unknown error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch') ||
           error.message.toLowerCase().includes('connection');
  }
  return false;
};

export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('timeout') ||
           error.message.toLowerCase().includes('timed out');
  }
  return false;
};

export const logError = (error: unknown, context?: string): void => {
  const formattedError = formatError(error);
  const logMessage = context 
    ? `[${context}] ${formattedError}`
    : formattedError;
  
  console.error(logMessage, error);
};

export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    logError(error, 'safeAsync');
    return fallback;
  }
};

export const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Gets user-friendly suggestions for resolving an error based on its type
 * 
 * @param errorType The type of error
 * @returns User-friendly suggestions for resolving the error
 */
export const getErrorSuggestions = (errorType: ErrorType): string[] => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Restart the application'
      ];
    
    case ErrorType.AUTHENTICATION:
      return [
        'Check your login credentials',
        'Try logging out and logging back in',
        'Reset your password if you continue to have issues'
      ];
    
    case ErrorType.AUTHORIZATION:
      return [
        'You may not have permission to access this resource',
        'Contact your administrator for assistance'
      ];
    
    case ErrorType.VALIDATION:
      return [
        'Check the input fields for errors',
        'Ensure all required fields are filled out correctly'
      ];
    
    case ErrorType.DATABASE:
      return [
        'Try restarting the application',
        'Your data might be corrupted, consider restoring from a backup'
      ];
    
    case ErrorType.AI_SERVICE:
      return [
        'Check your API key and settings',
        'The AI service may be experiencing issues',
        'Try again with different parameters or prompts'
      ];
    
    case ErrorType.TIMEOUT:
      return [
        'The operation took too long to complete',
        'Try again when the system is less busy',
        'Check your internet connection speed'
      ];
    
    case ErrorType.UNKNOWN:
    default:
      return [
        'Try restarting the application',
        'If the problem persists, contact support'
      ];
  }
};
