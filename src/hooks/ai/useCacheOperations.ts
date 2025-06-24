
import { useCallback } from 'react';
import type { AIState, AIContextAction } from '@/contexts/AIContext';

export const useCacheOperations = (
  state: AIState,
  dispatch: React.Dispatch<AIContextAction>
) => {
  const getCachedResult = useCallback((key: string): string | null => {
    if (!state.settings.cacheEnabled) return null;
    
    const cached = state.resultsCache.get(key);
    if (!cached) return null;
    
    // Check if cache entry is expired
    const isExpired = Date.now() - cached.timestamp > state.settings.cacheExpiryMs;
    if (isExpired) {
      // Remove expired entry
      const newCache = new Map(state.resultsCache);
      newCache.delete(key);
      dispatch({ type: 'CLEAR_CACHE' });
      return null;
    }
    
    return cached.result;
  }, [state.settings.cacheEnabled, state.settings.cacheExpiryMs, state.resultsCache, dispatch]);

  const cacheResult = useCallback((key: string, result: string) => {
    if (!state.settings.cacheEnabled) return;
    
    dispatch({
      type: 'CACHE_RESULT',
      payload: { key, result }
    });
  }, [state.settings.cacheEnabled, dispatch]);

  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
  }, [dispatch]);

  return {
    getCachedResult,
    cacheResult,
    clearCache
  };
};
