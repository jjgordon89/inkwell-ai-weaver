
import { useCallback } from 'react';
import { AI_PROVIDERS } from './constants';
import type { AIState, AIContextAction } from '@/contexts/AIContext';

export const useProviderOperations = (
  state: AIState,
  dispatch: React.Dispatch<AIContextAction>
) => {
  const setProvider = useCallback((provider: string) => {
    dispatch({ type: 'SET_PROVIDER', payload: provider });
    
    // Auto-select first available model for the provider
    const providerInfo = AI_PROVIDERS.find(p => p.name === provider);
    if (providerInfo && providerInfo.models.length > 0) {
      dispatch({ type: 'SET_MODEL', payload: providerInfo.models[0] });
    }
  }, [dispatch]);

  const setModel = useCallback((model: string) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, [dispatch]);

  const setApiKey = useCallback((provider: string, key: string) => {
    dispatch({ 
      type: 'SET_API_KEY', 
      payload: { provider, key } 
    });
    
    // Store in localStorage for persistence
    localStorage.setItem(`ai-api-key-${provider}`, key);
  }, [dispatch]);

  const testConnection = useCallback(async (provider?: string) => {
    const targetProvider = provider || state.selectedProvider;
    const providerInfo = AI_PROVIDERS.find(p => p.name === targetProvider);
    
    if (!providerInfo) {
      throw new Error(`Provider ${targetProvider} not found`);
    }

    dispatch({ type: 'SET_TESTING_CONNECTION', payload: true });
    
    try {
      // Mock connection test for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (providerInfo.type === 'local') {
        // For local providers, just return success
        return { success: true, message: 'Local provider ready' };
      }
      
      const apiKey = state.apiKeys[targetProvider];
      if (providerInfo.requiresApiKey && !apiKey) {
        throw new Error('API key required');
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          error: new Error(errorMessage), 
          operation: 'testConnection' 
        } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_TESTING_CONNECTION', payload: false });
    }
  }, [state.selectedProvider, state.apiKeys, dispatch]);

  const getCurrentProviderInfo = useCallback(() => {
    return AI_PROVIDERS.find(p => p.name === state.selectedProvider);
  }, [state.selectedProvider]);

  const isCurrentProviderConfigured = useCallback(() => {
    const provider = getCurrentProviderInfo();
    if (!provider) return false;
    
    if (provider.type === 'local') {
      return true;
    }
    
    if (provider.requiresApiKey) {
      return !!state.apiKeys[state.selectedProvider];
    }
    
    return true;
  }, [getCurrentProviderInfo, state.apiKeys, state.selectedProvider]);

  return {
    setProvider,
    setModel,
    setApiKey,
    testConnection,
    getCurrentProviderInfo,
    isCurrentProviderConfigured
  };
};
