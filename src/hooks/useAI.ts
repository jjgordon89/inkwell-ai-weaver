
import { useState, useEffect } from 'react';

export interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true
  },
  {
    name: 'Groq',
    models: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    requiresApiKey: true
  },
  {
    name: 'Local Model',
    models: ['llama-7b', 'codellama-13b', 'mistral-7b'],
    requiresApiKey: false
  }
];

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('OpenAI');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai-api-keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Failed to load saved API keys:', error);
      }
    }
  }, []);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ai-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Update selected model when provider changes
  useEffect(() => {
    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    if (currentProvider && currentProvider.models.length > 0) {
      // If current model is not available for the new provider, select the first available model
      if (!currentProvider.models.includes(selectedModel)) {
        console.log(`Switching model from ${selectedModel} to ${currentProvider.models[0]} for provider ${selectedProvider}`);
        setSelectedModel(currentProvider.models[0]);
      }
    }
  }, [selectedProvider]);

  const handleProviderChange = (newProvider: string) => {
    console.log(`Provider changed from ${selectedProvider} to ${newProvider}`);
    setSelectedProvider(newProvider);
  };

  const setApiKey = (providerName: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerName]: key
    }));
  };

  const testConnection = async (providerName: string): Promise<boolean> => {
    const apiKey = apiKeys[providerName];
    if (!apiKey) {
      console.error('No API key provided for', providerName);
      return false;
    }

    setIsTestingConnection(true);
    
    try {
      // Simulate API test - in a real implementation, you'd make actual API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll randomly succeed or fail
      const success = Math.random() > 0.3;
      
      if (success) {
        console.log(`✅ Connection test successful for ${providerName}`);
      } else {
        console.error(`❌ Connection test failed for ${providerName}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Connection test failed for ${providerName}:`, error);
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const processText = async (
    text: string,
    action: 'improve' | 'shorten' | 'expand' | 'fix-grammar'
  ): Promise<string> => {
    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    
    if (currentProvider?.requiresApiKey && !apiKeys[selectedProvider]) {
      throw new Error(`API key required for ${selectedProvider}`);
    }

    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = {
        improve: `Enhanced version: ${text}`,
        shorten: text.slice(0, Math.floor(text.length * 0.7)),
        expand: `${text} Additional details and context would enhance this passage further.`,
        'fix-grammar': text.replace(/\b(i)\b/g, 'I')
      };
      
      return responses[action] || text;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSuggestions = async (context: string): Promise<string[]> => {
    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    
    if (currentProvider?.requiresApiKey && !apiKeys[selectedProvider]) {
      throw new Error(`API key required for ${selectedProvider}`);
    }

    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const suggestions = [
        'Consider adding more sensory details',
        'This character could use more development',
        'The pacing might benefit from a slower buildup',
        'Add dialogue to break up the narrative'
      ];
      
      return suggestions;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    isTestingConnection,
    selectedProvider,
    selectedModel,
    setSelectedProvider: handleProviderChange,
    setSelectedModel,
    apiKeys,
    setApiKey,
    testConnection,
    processText,
    generateSuggestions,
    availableProviders: AI_PROVIDERS
  };
};
