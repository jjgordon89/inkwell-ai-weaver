
import { useState } from 'react';

export interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    requiresApiKey: true
  },
  {
    name: 'Groq',
    models: ['llama2-70b-4096', 'mixtral-8x7b-32768'],
    requiresApiKey: true
  },
  {
    name: 'Local Model',
    models: ['llama-7b', 'codellama-13b'],
    requiresApiKey: false
  }
];

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('OpenAI');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');

  const processText = async (
    text: string,
    action: 'improve' | 'shorten' | 'expand' | 'fix-grammar'
  ): Promise<string> => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = {
      improve: `Enhanced version: ${text}`,
      shorten: text.slice(0, Math.floor(text.length * 0.7)),
      expand: `${text} Additional details and context would enhance this passage further.`,
      'fix-grammar': text.replace(/\b(i)\b/g, 'I')
    };
    
    setIsProcessing(false);
    return responses[action] || text;
  };

  const generateSuggestions = async (context: string): Promise<string[]> => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = [
      'Consider adding more sensory details',
      'This character could use more development',
      'The pacing might benefit from a slower buildup',
      'Add dialogue to break up the narrative'
    ];
    
    setIsProcessing(false);
    return suggestions;
  };

  return {
    isProcessing,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    processText,
    generateSuggestions,
    availableProviders: AI_PROVIDERS
  };
};
