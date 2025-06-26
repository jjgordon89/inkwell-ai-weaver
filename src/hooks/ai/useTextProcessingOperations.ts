
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
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const provider = AI_PROVIDERS.find(p => p.name === state.selectedProvider);
      if (!provider) {
        throw new Error(`Provider ${state.selectedProvider} not found`);
      }

      const apiKey = state.apiKeys[state.selectedProvider];
      if (provider.requiresApiKey && !apiKey) {
        throw new Error(`API key required for ${state.selectedProvider}`);
      }

      // Generate the prompt for the action
      const prompt = getPromptForAction(action, text);
      
      // Make the API request (this will use mock processing for now)
      const result = await makeAPIRequest(provider, apiKey, state.selectedModel, prompt, action);
      
      // Clean the response
      const cleanedResult = cleanAIResponse(result, action);
      
      // Cache the result
      if (state.settings.cacheEnabled && cleanedResult) {
        cacheResult(cacheKey, cleanedResult);
      }

      return cleanedResult;
    } catch (error) {
      console.error('Text processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ 
        type: 'SET_ERROR', 
        payload: errorMessage
      });
      throw error;
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
