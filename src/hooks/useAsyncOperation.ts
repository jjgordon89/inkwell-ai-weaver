
import { useState, useCallback } from 'react';

interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
  lastOperation: string | null;
}

export const useAsyncOperation = () => {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    lastOperation: null
  });

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      lastOperation: operationName
    }));

    try {
      const result = await operation();
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj
      }));
      console.error(`❌ ${operationName} failed:`, errorObj);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      lastOperation: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastOperation: null
    });
  }, []);

  return {
    ...state,
    execute,
    clearError,
    reset
  };
};
