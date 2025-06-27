
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
    
    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > state.settings.cacheExpiryMs) {
      // Remove expired cache entry
      const newCache = new Map(state.resultsCache);
      newCache.delete(key);
      dispatch({ type: 'CLEAR_CACHE' });
      return null;
    }
    
    return cached.result;
  }, [state.resultsCache, state.settings.cacheEnabled, state.settings.cacheExpiryMs, dispatch]);

  const cacheResult = useCallback((key: string, result: string) => {
    if (!state.settings.cacheEnabled) return;
    
    dispatch({
      type: 'CACHE_RESULT',
      payload: { key, result }
    });
  }, [state.settings.cacheEnabled, dispatch]);

  return { getCachedResult, cacheResult };
};
