
import { useState, useCallback } from 'react';

interface AIError {
  message: string;
  type: 'connection' | 'api' | 'parsing' | 'validation' | 'unknown';
  timestamp: number;
}

export const useAIErrorHandler = () => {
  const [error, setError] = useState<AIError | null>(null);

  const handleError = useCallback((error: unknown, type: AIError['type'] = 'unknown') => {
    console.error(`AI Error (${type}):`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    setError({
      message: errorMessage,
      type,
      timestamp: Date.now()
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    errorType: AIError['type'] = 'unknown'
  ): Promise<T | null> => {
    try {
      clearError();
      return await operation();
    } catch (error) {
      handleError(error, errorType);
      return null;
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryWithErrorHandling
  };
};
