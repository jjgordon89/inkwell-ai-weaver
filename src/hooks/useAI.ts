
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

  // Enhanced error handling wrapper for processText
  const safeProcessText = async (text: string, action: AIAction): Promise<string> => {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for processing');
      }
      
      if (!isCurrentProviderConfigured()) {
        throw new Error('AI provider not configured properly. Please configure your AI provider in the AI Assistance settings.');
      }

      return await processText(text, action);
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  };

  // Enhanced suggestions generator
  const generateSuggestions = async (context: string): Promise<string[]> => {
    try {
      if (!context || context.trim().length === 0) {
        return [];
      }
      
      const result = await safeProcessText(
        `Generate 3-5 writing suggestions based on this context: ${context}`,
        'improve'
      );
      return result.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  };

  return {
    // Core processing
    isProcessing,
    isTestingConnection,
    processText: safeProcessText,
    generateSuggestions,
    
    // Provider management
    selectedProvider,
    selectedModel,
    setSelectedProvider: setProvider,
    setSelectedModel: setModel,
    availableProviders,
    getCurrentProviderInfo,
    isCurrentProviderConfigured,
    
    // Configuration
    apiKeys,
    setApiKey,
    testConnection,
    
    // State management
    error,
    clearError,
    settings,
    updateSettings
  };
};
