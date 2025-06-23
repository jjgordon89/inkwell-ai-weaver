
import { useEffect } from 'react';
import { AI_PROVIDERS } from './constants';
import { DatabaseAIStorage } from '@/lib/databaseAIStorage';
import type { AIContextAction } from '@/contexts/AIContext';

export const useInitialState = (dispatch: React.Dispatch<AIContextAction>) => {
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await DatabaseAIStorage.loadAISettings();
        dispatch({
          type: 'LOAD_INITIAL_STATE',
          payload: {
            selectedProvider: settings.selectedProvider || 'OpenAI',
            selectedModel: settings.selectedModel || 'gpt-4.1-2025-04-14',
            apiKeys: settings.apiKeys,
            availableProviders: AI_PROVIDERS
          }
        });
      } catch (error) {
        console.error('Failed to load AI settings from database:', error);
        dispatch({
          type: 'LOAD_INITIAL_STATE',
          payload: {
            selectedProvider: 'OpenAI',
            selectedModel: 'gpt-4.1-2025-04-14',
            apiKeys: {},
            availableProviders: AI_PROVIDERS
          }
        });
      }
    };

    loadSettings();
  }, [dispatch]);
};
