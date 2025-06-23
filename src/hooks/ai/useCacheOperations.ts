
import { useCallback } from 'react';
import type { AIContextDispatch } from '@/contexts/AIContext';

interface CacheState {
  resultsCache: Map<string, { result: string; timestamp: number }>;
  settings: {
    cacheEnabled: boolean;
    cacheExpiryMs: number;
  };
}

export const useCacheOperations = (state: CacheState, dispatch: AIContextDispatch) => {
  const getCachedResult = useCallback((key: string): string | null => {
    if (!state.settings.cacheEnabled) return null;
    
    const cached = state.resultsCache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > state.settings.cacheExpiryMs;
    if (isExpired) {
      dispatch({ type: 'CLEAR_CACHE' });
      return null;
    }
    
    return cached.result;
  }, [state.resultsCache, state.settings.cacheEnabled, state.settings.cacheExpiryMs, dispatch]);

  const cacheResult = useCallback((key: string, result: string) => {
    if (state.settings.cacheEnabled) {
      dispatch({ type: 'CACHE_RESULT', payload: { key, result } });
    }
  }, [state.settings.cacheEnabled, dispatch]);

  return { getCachedResult, cacheResult };
};
