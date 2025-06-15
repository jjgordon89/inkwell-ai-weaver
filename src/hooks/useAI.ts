
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

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('ai-api-keys');
      const savedProvider = localStorage.getItem('ai-selected-provider');
      const savedModel = localStorage.getItem('ai-selected-model');

      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
      if (savedProvider && AI_PROVIDERS.find(p => p.name === savedProvider)) {
        setSelectedProvider(savedProvider);
      }
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    } catch (error) {
      console.error('Failed to load saved AI settings:', error);
    }
  }, []);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ai-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Save provider to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai-selected-provider', selectedProvider);
  }, [selectedProvider]);

  // Save model to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai-selected-model', selectedModel);
  }, [selectedModel]);

  // Update selected model when provider changes
  useEffect(() => {
    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    if (currentProvider && currentProvider.models.length > 0) {
      // If current model is not available for the new provider, select the first available model
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

  const setApiKey = (providerName: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerName]: key.trim()
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
      console.log(`Testing connection for ${providerName}...`);
      
      // Simulate API test - in a real implementation, you'd make actual API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll randomly succeed or fail (80% success rate)
      const success = Math.random() > 0.2;
      
      if (success) {
        console.log(`✅ Connection test successful for ${providerName}`);
      } else {
        console.error(`❌ Connection test failed for ${providerName} - Invalid API key or service unavailable`);
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
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for processing');
    }

    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    
    if (!currentProvider) {
      throw new Error(`Invalid provider: ${selectedProvider}`);
    }

    if (currentProvider.requiresApiKey && !apiKeys[selectedProvider]) {
      throw new Error(`API key required for ${selectedProvider}. Please add your API key in the settings.`);
    }

    console.log(`Processing text with ${selectedProvider} (${selectedModel}) - Action: ${action}`);
    setIsProcessing(true);
    
    try {
      // Simulate AI processing with realistic delays
      const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Generate realistic responses based on action
      let result: string;
      
      switch (action) {
        case 'improve':
          result = `Enhanced version using ${selectedModel}: ${text.replace(/\b(good|nice|ok)\b/gi, 'excellent').replace(/\b(bad|poor)\b/gi, 'suboptimal')}`;
          break;
        case 'shorten':
          const words = text.split(' ');
          const targetLength = Math.max(Math.floor(words.length * 0.7), 3);
          result = words.slice(0, targetLength).join(' ') + (targetLength < words.length ? '...' : '');
          break;
        case 'expand':
          result = `${text} This expanded version provides additional context and detail, offering readers a more comprehensive understanding of the topic while maintaining the original meaning and intent.`;
          break;
        case 'fix-grammar':
          result = text
            .replace(/\bi\b/g, 'I')
            .replace(/\s+/g, ' ')
            .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => `${punct} ${letter.toUpperCase()}`)
            .trim();
          break;
        default:
          result = text;
      }
      
      console.log(`✅ Text processing completed successfully`);
      return result;
    } catch (error) {
      console.error('❌ Text processing failed:', error);
      throw new Error(`Failed to process text: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSuggestions = async (context: string): Promise<string[]> => {
    if (!context || context.trim().length === 0) {
      return [];
    }

    const currentProvider = AI_PROVIDERS.find(p => p.name === selectedProvider);
    
    if (!currentProvider) {
      throw new Error(`Invalid provider: ${selectedProvider}`);
    }

    if (currentProvider.requiresApiKey && !apiKeys[selectedProvider]) {
      throw new Error(`API key required for ${selectedProvider}`);
    }

    console.log(`Generating suggestions with ${selectedProvider} (${selectedModel})`);
    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate contextual suggestions
      const suggestions = [
        'Consider adding more sensory details to enhance immersion',
        'This character could benefit from deeper emotional development',
        'The pacing might be improved with shorter, punchier sentences',
        'Try adding dialogue to break up narrative sections',
        'Consider the emotional arc of this scene',
        'This moment could use more specific, concrete details'
      ];
      
      // Return 3-4 random suggestions
      const shuffled = suggestions.sort(() => 0.5 - Math.random());
      const result = shuffled.slice(0, Math.floor(Math.random() * 2) + 3);
      
      console.log(`✅ Generated ${result.length} suggestions`);
      return result;
    } catch (error) {
      console.error('❌ Suggestion generation failed:', error);
      throw new Error(`Failed to generate suggestions: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentProviderInfo = () => {
    return AI_PROVIDERS.find(p => p.name === selectedProvider);
  };

  const isProviderConfigured = (providerName: string) => {
    const provider = AI_PROVIDERS.find(p => p.name === providerName);
    if (!provider) return false;
    
    return !provider.requiresApiKey || Boolean(apiKeys[providerName]);
  };

  const isCurrentProviderConfigured = () => {
    return isProviderConfigured(selectedProvider);
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
    availableProviders: AI_PROVIDERS,
    getCurrentProviderInfo,
    isProviderConfigured,
    isCurrentProviderConfigured
  };
};
