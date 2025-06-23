
import { useEffect, useCallback } from 'react';
import { AI_PROVIDERS } from './constants';
import { testProviderConnection } from './connectionTest';
import type { AIContextAction } from '@/contexts/AIContext';

interface ProviderState {
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
}

export const useProviderOperations = (state: ProviderState, dispatch: React.Dispatch<AIContextAction>) => {
  // Auto-update model when provider changes
  useEffect(() => {
    const currentProvider = AI_PROVIDERS.find(p => p.name === state.selectedProvider);
    if (currentProvider && currentProvider.models.length > 0) {
      if (!currentProvider.models.includes(state.selectedModel)) {
        console.log(`Auto-switching model from ${state.selectedModel} to ${currentProvider.models[0]} for provider ${state.selectedProvider}`);
        dispatch({ type: 'SET_MODEL', payload: currentProvider.models[0] });
      }
    }
  }, [state.selectedProvider, state.selectedModel, dispatch]);

  const setProvider = useCallback((provider: string) => {
    console.log(`Provider changed from ${state.selectedProvider} to ${provider}`);
    dispatch({ type: 'SET_PROVIDER', payload: provider });
  }, [state.selectedProvider, dispatch]);

  const setModel = useCallback((model: string) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, [dispatch]);

  const setApiKey = useCallback((provider: string, key: string) => {
    dispatch({ type: 'SET_API_KEY', payload: { provider, key: key.trim() } });
  }, [dispatch]);

  const testConnection = useCallback(async (providerName: string): Promise<boolean> => {
    dispatch({ type: 'SET_TESTING_CONNECTION', payload: true });
    
    try {
      const provider = AI_PROVIDERS.find(p => p.name === providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }
      
      const apiKey = state.apiKeys[providerName];
      if (!apiKey && provider.requiresApiKey) {
        throw new Error(`API key required for ${providerName}`);
      }
      
      const result = await testProviderConnection(provider, apiKey || '');
      return result;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          error: error instanceof Error ? error : new Error('Connection test failed'),
          operation: 'test connection'
        }
      });
      return false;
    } finally {
      dispatch({ type: 'SET_TESTING_CONNECTION', payload: false });
    }
  }, [state.apiKeys, dispatch]);

  const getCurrentProviderInfo = useCallback(() => {
    return AI_PROVIDERS.find(p => p.name === state.selectedProvider);
  }, [state.selectedProvider]);

  const isCurrentProviderConfigured = useCallback(() => {
    const provider = getCurrentProviderInfo();
    if (!provider) return false;
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
