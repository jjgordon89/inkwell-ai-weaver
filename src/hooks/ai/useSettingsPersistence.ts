
import { useEffect } from 'react';
import type { AIState } from '@/contexts/AIContext';

export const useSettingsPersistence = (state: AIState) => {
  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ai-selected-provider', state.selectedProvider);
      localStorage.setItem('ai-selected-model', state.selectedModel);
      localStorage.setItem('ai-api-keys', JSON.stringify(state.apiKeys));
      localStorage.setItem('ai-settings', JSON.stringify(state.settings));
    } catch (error) {
      console.warn('Failed to persist AI settings:', error);
    }
  }, [state.selectedProvider, state.selectedModel, state.apiKeys, state.settings]);
};
