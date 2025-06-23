
import { useEffect } from 'react';
import { DatabaseAIStorage } from '@/lib/databaseAIStorage';

interface SettingsState {
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
  settings: any;
}

export const useSettingsPersistence = (state: SettingsState) => {
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await DatabaseAIStorage.saveSelectedProvider(state.selectedProvider);
        await DatabaseAIStorage.saveSelectedModel(state.selectedModel);
        await DatabaseAIStorage.saveApiKeys(state.apiKeys);
      } catch (error) {
        console.error('Failed to save AI settings to database:', error);
      }
    };

    if (state.selectedProvider) {
      saveSettings();
    }
  }, [state.selectedProvider, state.selectedModel, state.apiKeys]);

  useEffect(() => {
    const settingsToSave = state.settings;
    localStorage.setItem('ai-configuration', JSON.stringify(settingsToSave));
  }, [state.settings]);
};
