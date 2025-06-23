
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
    if (currentProvider) {
      // Handle custom endpoint provider
      if (currentProvider.name === 'Custom OpenAI Compatible') {
        const customModels = localStorage.getItem('custom-openai-models');
        if (customModels) {
          const parsedModels = JSON.parse(customModels);
          if (parsedModels.length > 0) {
            // If current model is not in custom models, switch to first custom model
            if (!parsedModels.includes(state.selectedModel)) {
              console.log(`Auto-switching to first custom model: ${parsedModels[0]}`);
              dispatch({ type: 'SET_MODEL', payload: parsedModels[0] });
            }
          } else {
            // No custom models configured, clear selected model
            if (state.selectedModel) {
              console.log('No custom models configured, clearing selected model');
              dispatch({ type: 'SET_MODEL', payload: '' });
            }
          }
        } else {
          // No custom models configured, clear selected model
          if (state.selectedModel) {
            console.log('No custom models configured, clearing selected model');
            dispatch({ type: 'SET_MODEL', payload: '' });
          }
        }
      }
      // Handle local providers
      else if (currentProvider.type === 'local') {
        // For local providers, we'll populate models dynamically
        if (currentProvider.models.length === 0) {
          console.log(`Local provider ${currentProvider.name} detected, models will be loaded dynamically`);
        }
      }
      // Handle regular providers
      else if (currentProvider.models.length > 0) {
        if (!currentProvider.models.includes(state.selectedModel)) {
          console.log(`Auto-switching model from ${state.selectedModel} to ${currentProvider.models[0]} for provider ${state.selectedProvider}`);
          dispatch({ type: 'SET_MODEL', payload: currentProvider.models[0] });
        }
      }
    }
  }, [state.selectedProvider, state.selectedModel, dispatch]);

  const setProvider = useCallback((provider: string) => {
    console.log(`Provider changed from ${state.selectedProvider} to ${provider}`);
    dispatch({ type: 'SET_PROVIDER', payload: provider });
  }, [state.selectedProvider, dispatch]);

  const setModel = useCallback((model: string) => {
    console.log(`Model changed to: ${model}`);
    dispatch({ type: 'SET_MODEL', payload: model });
  }, [dispatch]);

  const setApiKey = useCallback((provider: string, key: string) => {
    console.log(`API key set for provider: ${provider}`);
    dispatch({ type: 'SET_API_KEY', payload: { provider, key: key.trim() } });
  }, [dispatch]);

  const testConnection = useCallback(async (providerName: string): Promise<boolean> => {
    dispatch({ type: 'SET_TESTING_CONNECTION', payload: true });
    
    try {
      const provider = AI_PROVIDERS.find(p => p.name === providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }
      
      // Handle custom endpoint provider
      if (provider.name === 'Custom OpenAI Compatible') {
        const customEndpoint = localStorage.getItem('custom-openai-endpoint');
        if (!customEndpoint) {
          throw new Error('Custom endpoint URL not configured');
        }
        
        const apiKey = state.apiKeys[providerName];
        if (!apiKey) {
          throw new Error('API key required for custom endpoint');
        }
        
        // Test the custom endpoint
        console.log(`Testing custom endpoint: ${customEndpoint}`);
        const testResult = await fetch(customEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'test',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1
          })
        });
        
        return testResult.status !== 404; // Accept any response except 404
      }
      
      // Handle local providers
      if (provider.type === 'local') {
        console.log(`Testing local provider: ${provider.name}`);
        try {
          let endpoint = '';
          if (provider.name === 'Ollama') {
            endpoint = `${provider.apiEndpoint}/api/tags`;
          } else if (provider.name === 'LM Studio') {
            endpoint = `${provider.apiEndpoint}/v1/models`;
          }
          
          const response = await fetch(endpoint);
          return response.ok;
        } catch (error) {
          console.warn(`Local provider ${provider.name} not available:`, error);
          return false;
        }
      }
      
      // Handle regular cloud providers
      const apiKey = state.apiKeys[providerName];
      if (!apiKey && provider.requiresApiKey) {
        throw new Error(`API key required for ${providerName}`);
      }
      
      const result = await testProviderConnection(provider, apiKey || '');
      return result;
    } catch (error) {
      console.error(`Connection test failed for ${providerName}:`, error);
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
    
    // Custom endpoint provider
    if (provider.name === 'Custom OpenAI Compatible') {
      const customEndpoint = localStorage.getItem('custom-openai-endpoint');
      const customModels = localStorage.getItem('custom-openai-models');
      const hasApiKey = !!state.apiKeys[state.selectedProvider];
      return !!(customEndpoint && customModels && hasApiKey);
    }
    
    // Local providers
    if (provider.type === 'local') {
      return true; // Local providers are considered configured if available
    }
    
    // Cloud providers
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
