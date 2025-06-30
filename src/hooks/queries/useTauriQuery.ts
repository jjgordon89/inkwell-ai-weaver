import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { 
  UseQueryOptions, 
  UseMutationOptions,
  useQuery as useReactQuery,
  useMutation as useReactMutation,
  QueryKey
} from '@tanstack/react-query';

/**
 * Custom hook to create TanStack Query hooks with integrated toast notifications
 * and error handling.
 */
export function useTauriQuery() {
  const { toast } = useToast();
  
  /**
   * Error handler for query and mutation errors
   */
  const handleError = useCallback((error: unknown, fallbackMessage = 'An error occurred') => {
    console.error('Query error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : fallbackMessage;
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
    
    return errorMessage;
  }, [toast]);

  /**
   * Helper function for success toasts
   */
  const handleSuccess = useCallback((message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    });
  }, [toast]);
  
  /**
   * Wrapper for useQuery with integrated error handling
   */
  const useQuery = useCallback(<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'onError'> & {
      errorMessage?: string;
    }
  ) => {
    const { errorMessage, ...queryOptions } = options;
    
    return useReactQuery<TQueryFnData, TError, TData, TQueryKey>({
      ...queryOptions,
      onError: (error) => {
        handleError(error, errorMessage || 'Query failed');
        options.onError?.(error);
      },
    });
  }, [handleError]);
  
  /**
   * Wrapper for useMutation with integrated success and error handling
   */
  const useMutation = useCallback(<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
  >(
    options: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'onSuccess' | 'onError'> & {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
      onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
    }
  ) => {
    const { successMessage, errorMessage, onSuccess, onError, ...mutationOptions } = options;
    
    return useReactMutation<TData, TError, TVariables, TContext>({
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        if (successMessage) {
          handleSuccess(successMessage);
        }
        onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        handleError(error, errorMessage || 'Operation failed');
        onError?.(error, variables, context);
      },
    });
  }, [handleError, handleSuccess]);
  
  return {
    useQuery,
    useMutation,
    handleError,
    handleSuccess
  };
}
