
import { useEffect } from 'react';
import { AI_PROVIDERS } from './constants';
import type { AIContextAction } from '@/contexts/AIContext';

export const useInitialState = (dispatch: React.Dispatch<AIContextAction>) => {
  useEffect(() => {
    const loadInitialState = () => {
      try {
        // Load saved settings
        const savedProvider = localStorage.getItem('ai-selected-provider') || 'OpenAI';
        const savedModel = localStorage.getItem('ai-selected-model') || 'gpt-4.1-2025-04-14';
        const savedApiKeys = localStorage.getItem('ai-api-keys');
        const savedSettings = localStorage.getItem('ai-settings');

        let apiKeys = {};
        if (savedApiKeys) {
          try {
            apiKeys = JSON.parse(savedApiKeys);
          } catch (error) {
            console.warn('Failed to parse saved API keys:', error);
          }
        }

        let settings = {
          autoSuggest: true,
          realTimeProcessing: false,
          maxTokens: '1000',
          temperature: '0.7',
          cacheEnabled: true,
          cacheExpiryMs: 300000
        };

        if (savedSettings) {
          try {
            settings = { ...settings, ...JSON.parse(savedSettings) };
          } catch (error) {
            console.warn('Failed to parse saved settings:', error);
          }
        }

        dispatch({
          type: 'LOAD_INITIAL_STATE',
          payload: {
            selectedProvider: savedProvider,
            selectedModel: savedModel,
            apiKeys,
            settings,
            availableProviders: AI_PROVIDERS
          }
        });
      } catch (error) {
        console.error('Failed to load initial AI state:', error);
        // Load defaults
        dispatch({
          type: 'LOAD_INITIAL_STATE',
          payload: {
            availableProviders: AI_PROVIDERS
          }
        });
      }
    };

    loadInitialState();
  }, [dispatch]);
};
