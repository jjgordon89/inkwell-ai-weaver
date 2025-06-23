
import { useCallback } from 'react';
import { useAIContext } from '@/contexts/AIContext';
import { AI_PROVIDERS } from './constants';
import { useInitialState } from './useInitialState';
import { useSettingsPersistence } from './useSettingsPersistence';
import { useCacheOperations } from './useCacheOperations';
import { useProviderOperations } from './useProviderOperations';
import { useTextProcessingOperations } from './useTextProcessingOperations';
import type { AIAction as ProcessingAction } from './types';

export const useAIOperations = () => {
  const { state, dispatch } = useAIContext();

  // Load initial settings
  useInitialState(dispatch);

  // Handle settings persistence
  useSettingsPersistence(state);

  // Cache operations
  const { getCachedResult, cacheResult } = useCacheOperations(state, dispatch);

  // Provider operations
  const {
    setProvider,
    setModel,
    setApiKey,
    testConnection,
    getCurrentProviderInfo,
    isCurrentProviderConfigured
  } = useProviderOperations(state, dispatch);

  // Text processing operations
  const { processText } = useTextProcessingOperations(
    state,
    dispatch,
    getCachedResult,
    cacheResult
  );

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  }, [dispatch]);

  // Error management
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  // Enhanced provider configuration check
  const isProviderConfigured = useCallback((providerName: string) => {
    const provider = AI_PROVIDERS.find(p => p.name === providerName);
    if (!provider) return false;
    
    // Handle custom endpoint provider
    if (provider.name === 'Custom OpenAI Compatible') {
      const customEndpoint = localStorage.getItem('custom-openai-endpoint');
      const customModels = localStorage.getItem('custom-openai-models');
      const hasApiKey = !!state.apiKeys[providerName];
      return !!(customEndpoint && customModels && hasApiKey);
    }
    
    // Handle local providers
    if (provider.type === 'local') {
      return true; // Local providers don't require API keys
    }
    
    // Handle cloud providers
    if (provider.requiresApiKey) {
      return !!state.apiKeys[providerName];
    }
    
    return true;
  }, [state.apiKeys]);

  return {
    // State
    selectedProvider: state.selectedProvider,
    selectedModel: state.selectedModel,
    availableProviders: state.availableProviders,
    apiKeys: state.apiKeys,
    isProcessing: state.isProcessing,
    isTestingConnection: state.isTestingConnection,
    error: state.error,
    settings: state.settings,
    
    // Operations
    setProvider,
    setModel,
    setApiKey,
    testConnection,
    processText,
    updateSettings,
    clearError,
    
    // Helpers
    getCurrentProviderInfo,
    isCurrentProviderConfigured,
    isProviderConfigured
  };
};
