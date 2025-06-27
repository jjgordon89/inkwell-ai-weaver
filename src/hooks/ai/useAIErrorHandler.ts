
import { useCallback } from 'react';
import { useAIContext } from '@/contexts/AIContext';

export type RetryStrategy = 'immediate' | 'exponential' | 'user';
export type ErrorType = 'network' | 'api' | 'validation' | 'timeout' | 'generic';

interface RetryOptions {
  maxRetries?: number;
  strategy?: RetryStrategy;
  baseDelay?: number;
  maxDelay?: number;
}

export const useAIErrorHandler = () => {
  const { state, dispatch } = useAIContext();

  const getErrorType = (error: Error): ErrorType => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('api') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'api';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    
    return 'generic';
  };

  const shouldRetry = (error: Error, attempt: number, maxRetries: number): boolean => {
    const errorType = getErrorType(error);
    
    // Don't retry validation errors
    if (errorType === 'validation') {
      return false;
    }
    
    // Don't retry if we've exceeded max attempts
    if (attempt >= maxRetries) {
      return false;
    }
    
    return true;
  };

  const getRetryDelay = (attempt: number, strategy: RetryStrategy, baseDelay: number, maxDelay: number): number => {
    switch (strategy) {
      case 'immediate':
        return 0;
      case 'exponential':
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      case 'user':
        return 0; // User-initiated retry
      default:
        return baseDelay;
    }
  };

  const retryWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    errorType: ErrorType,
    options: RetryOptions = {}
  ): Promise<T | null> => {
    const {
      maxRetries = 3,
      strategy = 'exponential',
      baseDelay = 1000,
      maxDelay = 5000
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Clear any previous errors on retry
        if (attempt > 0 && state.error) {
          dispatch({ type: 'CLEAR_ERROR' });
        }

        const result = await operation();
        
        // Success - clear any errors
        if (state.error) {
          dispatch({ type: 'CLEAR_ERROR' });
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);
        
        // Check if we should retry
        if (!shouldRetry(lastError, attempt, maxRetries)) {
          break;
        }
        
        // Wait before retry (except for immediate strategy)
        const delay = getRetryDelay(attempt, strategy, baseDelay, maxDelay);
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed - set the error in state
    if (lastError) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          error: lastError,
          operation: `${errorType} operation`
        }
      });
    }

    return null;
  }, [state.error, dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const handleError = useCallback((error: Error, operation: string) => {
    console.error(`❌ ${operation} failed:`, error);
    dispatch({
      type: 'SET_ERROR',
      payload: {
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        operation
      }
    });
  }, [dispatch]);

  return {
    error: state.error,
    lastOperation: state.lastOperation,
    retryWithErrorHandling,
    clearError,
    handleError,
    getErrorType
  };
};
