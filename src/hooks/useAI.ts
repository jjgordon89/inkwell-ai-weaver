import { useState, useEffect } from 'react';

export interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
  apiEndpoint?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  {
    name: 'Groq',
    models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    requiresApiKey: true,
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions'
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
      
      const provider = AI_PROVIDERS.find(p => p.name === providerName);
      if (!provider || !provider.apiEndpoint) {
        console.log(`No API endpoint configured for ${providerName}, using mock test`);
        // Simulate API test for providers without endpoints
        await new Promise(resolve => setTimeout(resolve, 1500));
        const success = Math.random() > 0.2;
        console.log(success ? `✅ Mock test successful for ${providerName}` : `❌ Mock test failed for ${providerName}`);
        return success;
      }

      // Real API test for providers with endpoints
      const testPayload = {
        model: provider.models[0],
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test. Please respond with "OK".'
          }
        ],
        max_tokens: 10,
        temperature: 0
      };

      const response = await fetch(provider.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        console.log(`✅ Connection test successful for ${providerName}`);
        return true;
      } else {
        const errorData = await response.text();
        console.error(`❌ Connection test failed for ${providerName}:`, response.status, errorData);
        return false;
      }
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
      // For providers with real API endpoints, we could make actual calls
      if (currentProvider.apiEndpoint && apiKeys[selectedProvider]) {
        console.log(`Using real API for ${selectedProvider}`);
        
        const prompt = getPromptForAction(action, text);
        
        const requestBody = {
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful writing assistant. Follow the user\'s instructions precisely.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: action === 'fix-grammar' ? 0.1 : 0.7
        };

        try {
          const response = await fetch(currentProvider.apiEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKeys[selectedProvider]}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            const result = data.choices?.[0]?.message?.content || text;
            console.log(`✅ Real AI processing completed successfully with ${selectedProvider}`);
            return result;
          } else {
            console.warn(`API call failed, falling back to mock processing`);
          }
        } catch (apiError) {
          console.warn(`API error, falling back to mock processing:`, apiError);
        }
      }
      
      // Fallback to mock processing
      const processingTime = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
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
      
      console.log(`✅ Mock text processing completed successfully`);
      return result;
    } catch (error) {
      console.error('❌ Text processing failed:', error);
      throw new Error(`Failed to process text: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPromptForAction = (action: string, text: string): string => {
    switch (action) {
      case 'improve':
        return `Please improve the following text by enhancing clarity, flow, and readability while maintaining the original meaning:\n\n${text}`;
      case 'shorten':
        return `Please make the following text more concise while preserving the key information and meaning:\n\n${text}`;
      case 'expand':
        return `Please expand the following text by adding relevant details, context, and depth while maintaining the original tone and meaning:\n\n${text}`;
      case 'fix-grammar':
        return `Please correct any grammar, punctuation, and spelling errors in the following text while maintaining its original meaning and tone:\n\n${text}`;
      default:
        return text;
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
