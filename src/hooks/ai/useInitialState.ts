
import { useEffect } from 'react';
import { AI_PROVIDERS } from './constants';
import type { AIContextAction } from '@/contexts/AIContext';

export const useInitialState = (dispatch: React.Dispatch<AIContextAction>) => {
  useEffect(() => {
    // Load saved API keys from localStorage
    const savedKeys: Record<string, string> = {};
    AI_PROVIDERS.forEach(provider => {
      const savedKey = localStorage.getItem(`ai-api-key-${provider.name}`);
      if (savedKey) {
        savedKeys[provider.name] = savedKey;
      }
    });

    // Load saved provider and model
    const savedProvider = localStorage.getItem('ai-selected-provider');
    const savedModel = localStorage.getItem('ai-selected-model');

    // Load saved settings
    const savedSettings = localStorage.getItem('ai-settings');
    let settings = {};
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.warn('Failed to parse saved AI settings:', error);
      }
    }

    // Initialize state with saved values
    dispatch({
      type: 'LOAD_INITIAL_STATE',
      payload: {
        availableProviders: AI_PROVIDERS,
        apiKeys: savedKeys,
        selectedProvider: savedProvider || 'OpenAI',
        selectedModel: savedModel || 'gpt-4.1-2025-04-14',
        settings: {
          autoSuggest: true,
          realTimeProcessing: false,
          maxTokens: '1000',
          temperature: '0.7',
          cacheEnabled: true,
          cacheExpiryMs: 300000,
          ...settings
        }
      }
    });
  }, [dispatch]);
};
