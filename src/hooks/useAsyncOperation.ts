
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
  lastOperation: string | null;
}

interface ToastOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  loadingMessage?: string;
}

export const useAsyncOperation = () => {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    lastOperation: null
  });
  
  const { toast } = useToast();

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    toastOptions?: ToastOptions
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      loadingMessage = 'Processing...'
    } = toastOptions || {};
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      lastOperation: operationName
    }));
    
    // Show loading toast if specified
    let loadingToastId;
    if (loadingMessage) {
      loadingToastId = toast({
        title: operationName,
        description: loadingMessage,
      });
    }

    try {
      const result = await operation();
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
      
      // Show success toast if specified
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        });
      }
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj
      }));
      
      console.error(`❌ ${operationName} failed:`, errorObj);
      
      // Show error toast if specified
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorObj.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      
      return null;
    }
  }, [toast]);

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
