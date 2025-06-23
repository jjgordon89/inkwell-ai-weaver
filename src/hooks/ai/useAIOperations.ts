
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
    isCurrentProviderConfigured
  };
};
