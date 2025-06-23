
import { useCallback } from 'react';
import { AI_PROVIDERS } from './constants';
import { makeAPIRequest, performMockTextProcessing, getPromptForAction } from './textProcessing';
import { validateAIInput, validateAIResponse } from './aiUtils';
import type { AIAction, AIProvider } from './types';
import type { AIContextDispatch } from '@/contexts/AIContext';

interface TextProcessingState {
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
}

export const useTextProcessingOperations = (
  state: TextProcessingState, 
  dispatch: AIContextDispatch,
  getCachedResult: (key: string) => string | null,
  cacheResult: (key: string, result: string) => void
) => {
  const processText = useCallback(async (
    text: string,
    action: AIAction
  ): Promise<string> => {
    try {
      validateAIInput(text, 'text processing');
      
      const cacheKey = `${state.selectedProvider}-${state.selectedModel}-${action}-${text.slice(0, 100)}`;
      const cached = getCachedResult(cacheKey);
      if (cached) {
        console.log('Using cached result for text processing');
        return cached;
      }

      const currentProvider = AI_PROVIDERS.find(p => p.name === state.selectedProvider);
      if (!currentProvider) {
        throw new Error(`Invalid provider: ${state.selectedProvider}`);
      }

      if (currentProvider.requiresApiKey && !state.apiKeys[state.selectedProvider]) {
        throw new Error(`API key required for ${state.selectedProvider}. Please add your API key in the settings.`);
      }

      console.log(`Processing text with ${state.selectedProvider} (${state.selectedModel}) - Action: ${action}`);
      dispatch({ type: 'SET_PROCESSING', payload: true });

      let result: string;

      // Try real API if available and configured
      const canUseAPI = currentProvider.apiEndpoint && 
        (!currentProvider.requiresApiKey || state.apiKeys[state.selectedProvider]);

      if (canUseAPI) {
        console.log(`Using real API for ${state.selectedProvider}`);
        
        const prompt = getPromptForAction(action, text);
        const apiResult = await makeAPIRequest(
          currentProvider, 
          state.apiKeys[state.selectedProvider] || '', 
          state.selectedModel, 
          prompt, 
          action
        );
        
        if (apiResult) {
          const validation = validateAIResponse(apiResult);
          if (!validation.isValid) {
            console.warn('API response validation failed:', validation.errors);
            throw new Error(`Invalid API response: ${validation.errors.join(', ')}`);
          }
          result = apiResult;
          console.log(`✅ Real AI processing completed successfully with ${state.selectedProvider}`);
        } else {
          console.warn(`API call failed, falling back to mock processing`);
          result = await performMockTextProcessing(text, action, state.selectedModel);
        }
      } else {
        console.log(`Using mock processing for ${state.selectedProvider} (API not available or not configured)`);
        result = await performMockTextProcessing(text, action, state.selectedModel);
      }

      cacheResult(cacheKey, result);
      console.log(`✅ Text processing completed successfully`);
      return result;
    } catch (error) {
      console.error('❌ Text processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          error: new Error(`Failed to process text: ${errorMessage}`),
          operation: 'text processing'
        }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [
    state.selectedProvider, 
    state.selectedModel, 
    state.apiKeys, 
    getCachedResult, 
    cacheResult, 
    dispatch
  ]);

  return { processText };
};
