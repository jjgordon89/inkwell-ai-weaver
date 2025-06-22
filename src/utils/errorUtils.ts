
/**
 * Utility functions for error handling
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export const createError = (message: string, code?: string, details?: any): ErrorInfo => {
  return {
    message,
    code,
    details,
    timestamp: new Date()
  };
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    if (errorObj.message) {
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
