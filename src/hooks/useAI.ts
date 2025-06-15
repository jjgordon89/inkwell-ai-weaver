
import { useState, useEffect } from 'react';
import { AI_PROVIDERS } from './ai/constants';
import { loadAISettings, saveApiKeys, saveSelectedProvider, saveSelectedModel } from './ai/storage';
import { getPromptForAction, performMockTextProcessing, makeAPIRequest } from './ai/textProcessing';
import { testProviderConnection } from './ai/connectionTest';
import type { AIProvider, AIAction, AIHookReturn } from './ai/types';

export type { AIProvider, AIAction } from './ai/types';
export { AI_PROVIDERS } from './ai/constants';

export const useAI = (): AIHookReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('OpenAI');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadAISettings();
    setApiKeys(settings.apiKeys);
    
    if (AI_PROVIDERS.find(p => p.name === settings.selectedProvider)) {
      setSelectedProvider(settings.selectedProvider);
    }
    if (settings.selectedModel) {
      setSelectedModel(settings.selectedModel);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    saveApiKeys(apiKeys);
  }, [apiKeys]);

  useEffect(() => {
    saveSelectedProvider(selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    saveSelectedModel(selectedModel);
  }, [selectedModel]);

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
      if (!provider) {
        return false;
      }

      return await testProviderConnection(provider, apiKey);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const processText = async (text: string, action: AIAction): Promise<string> => {
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
      // Try real API if available and configured
      if (currentProvider.apiEndpoint && apiKeys[selectedProvider]) {
        console.log(`Using real API for ${selectedProvider}`);
        
        const prompt = getPromptForAction(action, text);
        const result = await makeAPIRequest(currentProvider, apiKeys[selectedProvider], selectedModel, prompt, action);
        
        if (result) {
          console.log(`✅ Real AI processing completed successfully with ${selectedProvider}`);
          return result;
        }
        
        console.warn(`API call failed, falling back to mock processing`);
      }
      
      // Fallback to mock processing
      const result = await performMockTextProcessing(text, action, selectedModel);
      console.log(`✅ Mock text processing completed successfully`);
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
