import { invoke } from '@tauri-apps/api/tauri';
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Generic function to invoke Tauri commands with proper error handling
 */
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Error invoking command '${command}':`, error);
    // Rethrow the error for the query/mutation to handle
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Type for query key factories
 */
export type QueryKeyFactory = {
  all: readonly unknown[];
  lists: (...args: unknown[]) => readonly unknown[];
  list: (filters?: Record<string, unknown>) => readonly unknown[];
  details: (...args: unknown[]) => readonly unknown[];
  detail: (id: string) => readonly unknown[];
};

/**
 * Helper to create query options with default settings
 */
export function createQueryOptions<TData, TError = Error, TQueryKey extends readonly unknown[] = readonly unknown[]>(
  queryFn: () => Promise<TData>,
  queryKey: TQueryKey,
  options?: Partial<Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>>
): UseQueryOptions<TData, TError, TData, TQueryKey> {
  return {
    queryKey,
    queryFn,
    ...options,
  } as UseQueryOptions<TData, TError, TData, TQueryKey>;
}

/**
 * Helper to create mutation options with default settings
 */
export function createMutationOptions<TData, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Partial<Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>>
): UseMutationOptions<TData, TError, TVariables, TContext> {
  return {
    mutationFn,
    ...options,
  };
}

/**
 * Convert a ProjectFilters or other filter interface to a Record<string, unknown>
 */
export function filtersToRecord<T extends object>(filters?: T): Record<string, unknown> | undefined {
  if (!filters) return undefined;
  return filters as Record<string, unknown>;
}
