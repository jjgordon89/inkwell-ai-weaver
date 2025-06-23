
import { useState } from 'react';
import { getPromptForAction, performMockTextProcessing, makeAPIRequest } from './textProcessing';
import { AI_PROVIDERS } from './constants';
import type { AIAction } from './types';

export const useAIProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processText = async (
    text: string, 
    action: AIAction, 
    selectedProvider: string,
    selectedModel: string,
    apiKeys: Record<string, string>
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
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000);
      });

      // Try real API if available and configured
      if (currentProvider.apiEndpoint && apiKeys[selectedProvider]) {
        console.log(`Using real API for ${selectedProvider}`);
        
        const prompt = getPromptForAction(action, text);
        const apiPromise = makeAPIRequest(currentProvider, apiKeys[selectedProvider], selectedModel, prompt, action);
        
        try {
          const result = await Promise.race([apiPromise, timeoutPromise]);
          if (result) {
            console.log(`✅ Real AI processing completed successfully with ${selectedProvider}`);
            return result;
          }
        } catch (apiError) {
          console.warn(`API call failed, falling back to mock processing:`, apiError);
        }
      }
      
      // Fallback to mock processing with timeout
      const mockPromise = performMockTextProcessing(text, action, selectedModel);
      const result = await Promise.race([mockPromise, timeoutPromise]);
      console.log(`✅ Mock text processing completed successfully`);
      return result;
    } catch (error) {
      console.error('❌ Text processing failed:', error);
      throw new Error(`Failed to process text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSuggestions = async (
    context: string,
    selectedProvider: string,
    selectedModel: string,
    apiKeys: Record<string, string>
  ): Promise<string[]> => {
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
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Suggestion generation timed out')), 15000);
      });

      // Simulate AI processing with timeout
      const processingPromise = new Promise<string[]>(resolve => {
        setTimeout(() => {
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
          resolve(result);
        }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
      });
      
      const result = await Promise.race([processingPromise, timeoutPromise]);
      console.log(`✅ Generated ${result.length} suggestions`);
      return result;
    } catch (error) {
      console.error('❌ Suggestion generation failed:', error);
      throw new Error(`Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processText,
    generateSuggestions
  };
};
