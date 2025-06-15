
import { useState, useEffect } from 'react';
import { loadAISettings, saveApiKeys, saveSelectedProvider, saveSelectedModel } from './storage';

export const useAISettings = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadAISettings();
    setApiKeys(settings.apiKeys);
  }, []);

  // Save API keys to localStorage when they change
  useEffect(() => {
    saveApiKeys(apiKeys);
  }, [apiKeys]);

  const setApiKey = (providerName: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerName]: key.trim()
    }));
  };

  const saveProviderSettings = (provider: string, model: string) => {
    saveSelectedProvider(provider);
    saveSelectedModel(model);
  };

  return {
    apiKeys,
    setApiKey,
    saveProviderSettings
  };
};
