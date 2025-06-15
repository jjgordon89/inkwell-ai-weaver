
import { useEffect, useCallback } from 'react';
import { useAIContext } from '@/contexts/AIContext';
import { AI_PROVIDERS } from './constants';
import { loadAISettings, saveApiKeys, saveSelectedProvider, saveSelectedModel } from './storage';
import { makeAPIRequest, performMockTextProcessing, getPromptForAction } from './textProcessing';
import { validateAIInput, validateAIResponse } from '@/hooks/ai/aiUtils';
import { testProviderConnection } from './connectionTest';
import type { AIAction as ProcessingAction } from './types';

export const useAIOperations = () => {
  const { state, dispatch } = useAIContext();

  // Load initial settings
  useEffect(() => {
    const settings = loadAISettings();
    dispatch({
      type: 'LOAD_INITIAL_STATE',
      payload: {
        selectedProvider: settings.selectedProvider || 'OpenAI',
        selectedModel: settings.selectedModel || 'gpt-4.1-2025-04-14',
        apiKeys: settings.apiKeys,
        availableProviders: AI_PROVIDERS
      }
    });
  }, [dispatch]);

  // Save settings when they change
  useEffect(() => {
    saveSelectedProvider(state.selectedProvider);
    saveSelectedModel(state.selectedModel);
    saveApiKeys(state.apiKeys);
  }, [state.selectedProvider, state.selectedModel, state.apiKeys]);

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

  // Cache management
  const getCachedResult = useCallback((key: string): string | null => {
    if (!state.settings.cacheEnabled) return null;
    
    const cached = state.resultsCache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > state.settings.cacheExpiryMs;
    if (isExpired) {
      const newCache = new Map(state.resultsCache);
      newCache.delete(key);
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

  // Provider operations
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

  // Connection testing
  const testConnection = useCallback(async (providerName: string): Promise<boolean> => {
    dispatch({ type: 'SET_TESTING_CONNECTION', payload: true });
    
    try {
      const result = await testProviderConnection(providerName, state.apiKeys);
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

  // Text processing
  const processText = useCallback(async (
    text: string,
    action: ProcessingAction
  ): Promise<string> => {
    try {
      validateAIInput(text, 'text processing');
      
      const cacheKey = `${state.selectedProvider}-${state.selectedModel}-${action}-${text.slice(0, 100)}`;
      const cached = getCachedResult(cacheKey);
      if (cached) {
        console.log('Using cached result for text processing');
        return cached;
      }

      const currentProvider = AI_PROVIDERS.find(p => p.name === state.selectedProvider);
      if (!currentProvider) {
        throw new Error(`Invalid provider: ${state.selectedProvider}`);
      }

      if (currentProvider.requiresApiKey && !state.apiKeys[state.selectedProvider]) {
        throw new Error(`API key required for ${state.selectedProvider}. Please add your API key in the settings.`);
      }

      console.log(`Processing text with ${state.selectedProvider} (${state.selectedModel}) - Action: ${action}`);
      dispatch({ type: 'SET_PROCESSING', payload: true });

      let result: string;

      // Try real API if available and configured
      if (currentProvider.apiEndpoint && state.apiKeys[state.selectedProvider]) {
        console.log(`Using real API for ${state.selectedProvider}`);
        
        const prompt = getPromptForAction(action, text);
        const apiResult = await makeAPIRequest(
          currentProvider, 
          state.apiKeys[state.selectedProvider], 
          state.selectedModel, 
          prompt, 
          action
        );
        
        if (apiResult) {
          const validation = validateAIResponse(apiResult);
          if (!validation.isValid) {
            console.warn('API response validation failed:', validation.errors);
            throw new Error(`Invalid API response: ${validation.errors.join(', ')}`);
          }
          result = apiResult;
          console.log(`✅ Real AI processing completed successfully with ${state.selectedProvider}`);
        } else {
          console.warn(`API call failed, falling back to mock processing`);
          result = await performMockTextProcessing(text, action, state.selectedModel);
        }
      } else {
        // Fallback to mock processing
        result = await performMockTextProcessing(text, action, state.selectedModel);
      }

      cacheResult(cacheKey, result);
      console.log(`✅ Text processing completed successfully`);
      return result;
    } catch (error) {
      console.error('❌ Text processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          error: new Error(`Failed to process text: ${errorMessage}`),
          operation: 'text processing'
        }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [
    state.selectedProvider, 
    state.selectedModel, 
    state.apiKeys, 
    getCachedResult, 
    cacheResult, 
    dispatch
  ]);

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    
    // Save to localStorage
    const settingsToSave = { ...state.settings, ...newSettings };
    localStorage.setItem('ai-configuration', JSON.stringify(settingsToSave));
  }, [state.settings, dispatch]);

  // Error management
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  // Helper functions
  const getCurrentProviderInfo = useCallback(() => {
    return AI_PROVIDERS.find(p => p.name === state.selectedProvider);
  }, [state.selectedProvider]);

  const isProviderConfigured = useCallback((providerName: string) => {
    const provider = AI_PROVIDERS.find(p => p.name === providerName);
    if (!provider) return false;
    
    return !provider.requiresApiKey || Boolean(state.apiKeys[providerName]);
  }, [state.apiKeys]);

  const isCurrentProviderConfigured = useCallback(() => {
    return isProviderConfigured(state.selectedProvider);
  }, [isProviderConfigured, state.selectedProvider]);

  return {
    // State
    ...state,
    
    // Provider operations
    setProvider,
    setModel,
    setApiKey,
    
    // Processing operations
    processText,
    testConnection,
    
    // Settings
    updateSettings,
    
    // Error handling
    clearError,
    
    // Helper functions
    getCurrentProviderInfo,
    isProviderConfigured,
    isCurrentProviderConfigured,
    
    // Cache operations
    clearCache: () => dispatch({ type: 'CLEAR_CACHE' })
  };
};
