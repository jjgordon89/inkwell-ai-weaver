
import { useState, useCallback } from 'react';

interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
}

const AI_PROVIDERS: AIProvider[] = [
  { name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'], requiresApiKey: true },
  { name: 'Anthropic', models: ['claude-3-sonnet', 'claude-3-haiku'], requiresApiKey: true },
  { name: 'Local', models: ['llama-2', 'mistral'], requiresApiKey: false }
];

export const useAI = () => {
  const [selectedProvider, setSelectedProvider] = useState('OpenAI');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const isCurrentProviderConfigured = useCallback(() => {
    const provider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    if (!provider) return false;
    
    if (provider.requiresApiKey) {
      return !!apiKeys[selectedProvider];
    }
    
    return true;
  }, [selectedProvider, apiKeys]);

  const processText = useCallback(async (text: string, action: 'improve' | 'continue' | 'summarize') => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured');
    }

    setIsProcessing(true);
    
    try {
      // Mock implementation - in real app, this would call the actual AI API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'improve':
          return `Improved version: ${text}`;
        case 'continue':
          return `${text} [AI continuation would go here...]`;
        case 'summarize':
          return `Summary: ${text.substring(0, 100)}...`;
        default:
          return text;
      }
    } catch (error) {
      console.error('AI processing failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isCurrentProviderConfigured]);

  const setApiKey = useCallback((provider: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  }, []);

  return {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    availableProviders: AI_PROVIDERS,
    apiKeys,
    setApiKey,
    isProcessing,
    processText,
    isCurrentProviderConfigured
  };
};
