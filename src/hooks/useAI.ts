
import { useAIOperations } from './ai/useAIOperations';
import type { AIProvider, AIAction } from './ai/types';

export type { AIProvider, AIAction } from './ai/types';
export { AI_PROVIDERS } from './ai/constants';

export const useAI = () => {
  const {
    selectedProvider,
    selectedModel,
    availableProviders,
    apiKeys,
    isProcessing,
    isTestingConnection,
    error,
    settings,
    setProvider,
    setModel,
    setApiKey,
    processText,
    testConnection,
    updateSettings,
    clearError,
    getCurrentProviderInfo,
    isCurrentProviderConfigured
  } = useAIOperations();

  return {
    isProcessing,
    isTestingConnection,
    selectedProvider,
    selectedModel,
    setSelectedProvider: setProvider,
    setSelectedModel: setModel,
    apiKeys,
    setApiKey,
    testConnection,
    processText,
    generateSuggestions: async (context: string): Promise<string[]> => {
      // This can be implemented using processText with a specific action
      const result = await processText(
        `Generate 3-5 writing suggestions based on this context: ${context}`,
        'improve'
      );
      return result.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    },
    availableProviders,
    getCurrentProviderInfo,
    isCurrentProviderConfigured,
    
    // Additional state management features
    error,
    clearError,
    settings,
    updateSettings
  };
};
