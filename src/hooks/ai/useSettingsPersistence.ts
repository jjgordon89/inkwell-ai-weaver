
import { useEffect } from 'react';
import type { AIState } from '@/contexts/AIContext';

export const useSettingsPersistence = (state: AIState) => {
  // Save provider selection
  useEffect(() => {
    localStorage.setItem('ai-selected-provider', state.selectedProvider);
  }, [state.selectedProvider]);

  // Save model selection
  useEffect(() => {
    localStorage.setItem('ai-selected-model', state.selectedModel);
  }, [state.selectedModel]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('ai-settings', JSON.stringify(state.settings));
  }, [state.settings]);
};
