
import { useState, useEffect } from 'react';
import { AI_PROVIDERS } from './constants';
import type { AIProvider } from './types';

export const useAIProviders = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('OpenAI');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');

  // Update selected model when provider changes
  useEffect(() => {
    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    if (currentProvider && currentProvider.models.length > 0) {
      if (!currentProvider.models.includes(selectedModel)) {
        console.log(`Auto-switching model from ${selectedModel} to ${currentProvider.models[0]} for provider ${selectedProvider}`);
        setSelectedModel(currentProvider.models[0]);
      }
    }
  }, [selectedProvider, selectedModel]);

  const handleProviderChange = (newProvider: string) => {
    console.log(`Provider changed from ${selectedProvider} to ${newProvider}`);
    setSelectedProvider(newProvider);
  };

  const getCurrentProviderInfo = () => {
    return AI_PROVIDERS.find(p => p.name === selectedProvider);
  };

  const isProviderConfigured = (providerName: string, apiKeys: Record<string, string>) => {
    const provider = AI_PROVIDERS.find(p => p.name === providerName);
    if (!provider) return false;
    
    return !provider.requiresApiKey || Boolean(apiKeys[providerName]);
  };

  const isCurrentProviderConfigured = (apiKeys: Record<string, string>) => {
    return isProviderConfigured(selectedProvider, apiKeys);
  };

  return {
    selectedProvider,
    selectedModel,
    setSelectedProvider: handleProviderChange,
    setSelectedModel,
    availableProviders: AI_PROVIDERS,
    getCurrentProviderInfo,
    isProviderConfigured,
    isCurrentProviderConfigured
  };
};
