
import { useCallback } from 'react';
import { getPromptForAction, cleanAIResponse, makeAPIRequest } from './textProcessing';
import { AI_PROVIDERS } from './constants';
import type { AIAction } from './types';
import type { AIState, AIContextAction } from '@/contexts/AIContext';

export const useTextProcessingOperations = (
  state: AIState,
  dispatch: React.Dispatch<AIContextAction>,
  getCachedResult: (key: string) => string | null,
  cacheResult: (key: string, result: string) => void
) => {
  const processText = useCallback(async (text: string, action: AIAction): Promise<string> => {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for processing');
    }

    // Create cache key
    const cacheKey = `${state.selectedProvider}-${state.selectedModel}-${action}-${text.slice(0, 100)}`;
    
    // Check cache first
    if (state.settings.cacheEnabled) {
      const cached = getCachedResult(cacheKey);
      if (cached) {
        console.log('Using cached result for text processing');
        return cached;
      }
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    try {
      const provider = AI_PROVIDERS.find(p => p.name === state.selectedProvider);
      if (!provider) {
        throw new Error(`Provider ${state.selectedProvider} not found`);
      }

      const apiKey = state.apiKeys[state.selectedProvider];
      if (provider.requiresApiKey && !apiKey) {
        throw new Error(`API key required for ${state.selectedProvider}. Please add your API key in the AI Assistance settings.`);
      }

      console.log(`Processing text with ${state.selectedProvider} (${state.selectedModel}) - Action: ${action}`);

      // Generate the prompt for the action
      const prompt = getPromptForAction(action, text);
      
      // Make the API request (this includes fallback to mock processing)
      const result = await makeAPIRequest(provider, apiKey, state.selectedModel, prompt, action);
      
      // Clean the response
      const cleanedResult = cleanAIResponse(result, action);
      
      // Cache the result
      if (state.settings.cacheEnabled && cleanedResult) {
        cacheResult(cacheKey, cleanedResult);
      }

      console.log(`✅ Text processing completed successfully with ${state.selectedProvider}`);
      return cleanedResult;
    } catch (error) {
      console.error('Text processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Enhanced error handling with more specific messages
      let enhancedError = errorMessage;
      if (errorMessage.includes('API key')) {
        enhancedError = `${errorMessage} You can configure your API key in the AI Assistance settings.`;
      } else if (errorMessage.includes('connection')) {
        enhancedError = `${errorMessage} Please check your internet connection and try again.`;
      } else if (errorMessage.includes('timeout')) {
        enhancedError = `${errorMessage} The AI service took too long to respond. Please try again.`;
      }
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          error: new Error(enhancedError), 
          operation: `processText-${action}` 
        } 
      });
      throw new Error(enhancedError);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [
    state.selectedProvider,
    state.selectedModel,
    state.apiKeys,
    state.settings.cacheEnabled,
    dispatch,
    getCachedResult,
    cacheResult
  ]);

  return { processText };
};
