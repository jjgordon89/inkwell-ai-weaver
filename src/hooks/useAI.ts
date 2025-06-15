
import { useEffect } from 'react';
import { useAIProviders } from './ai/useAIProviders';
import { useAISettings } from './ai/useAISettings';
import { useAIConnection } from './ai/useAIConnection';
import { useAIProcessing } from './ai/useAIProcessing';
import type { AIProvider, AIAction, AIHookReturn } from './ai/types';

export type { AIProvider, AIAction } from './ai/types';
export { AI_PROVIDERS } from './ai/constants';

export const useAI = (): AIHookReturn => {
  const {
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    availableProviders,
    getCurrentProviderInfo,
    isProviderConfigured,
    isCurrentProviderConfigured
  } = useAIProviders();

  const {
    apiKeys,
    setApiKey,
    saveProviderSettings
  } = useAISettings();

  const {
    isTestingConnection,
    testConnection
  } = useAIConnection();

  const {
    isProcessing,
    processText: processTextBase,
    generateSuggestions: generateSuggestionsBase
  } = useAIProcessing();

  // Save provider and model settings when they change
  useEffect(() => {
    saveProviderSettings(selectedProvider, selectedModel);
  }, [selectedProvider, selectedModel, saveProviderSettings]);

  // Wrapper functions to inject current settings
  const processText = async (text: string, action: AIAction): Promise<string> => {
    return processTextBase(text, action, selectedProvider, selectedModel, apiKeys);
  };

  const generateSuggestions = async (context: string): Promise<string[]> => {
    return generateSuggestionsBase(context, selectedProvider, selectedModel, apiKeys);
  };

  const testConnectionForProvider = async (providerName: string): Promise<boolean> => {
    return testConnection(providerName, apiKeys);
  };

  return {
    isProcessing,
    isTestingConnection,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    apiKeys,
    setApiKey,
    testConnection: testConnectionForProvider,
    processText,
    generateSuggestions,
    availableProviders,
    getCurrentProviderInfo,
    isProviderConfigured: (providerName: string) => isProviderConfigured(providerName, apiKeys),
    isCurrentProviderConfigured: () => isCurrentProviderConfigured(apiKeys)
  };
};
