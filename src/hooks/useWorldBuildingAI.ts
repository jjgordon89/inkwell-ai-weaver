
import { useState } from 'react';
import { useAI } from './useAI';
import { useAsyncOperation } from './useAsyncOperation';
import { WorldElement } from '@/contexts/WritingContext';

export const useWorldBuildingAI = () => {
  const { processText, isCurrentProviderConfigured } = useAI();
  const { execute, isLoading: isGenerating } = useAsyncOperation();

  const generateWorldElement = async (prompt: string, type: WorldElement['type']): Promise<Partial<WorldElement>> => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured');
    }

    return execute(async () => {
      const aiPrompt = `Generate a ${type} for world building based on this description: "${prompt}". 
      Provide a name and detailed description.`;
      
      const response = await processText(aiPrompt, 'generate');
      
      return {
        name: `Generated ${type}`,
        type,
        description: response || `AI-generated ${type} description`,
      };
    }, 'generate world element');
  };

  const improveSuggestions = async (currentElements: WorldElement[]): Promise<string[]> => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured');
    }

    return execute(async () => {
      const aiPrompt = `Based on these existing world elements: ${currentElements.map(el => `${el.name} (${el.type})`).join(', ')}, 
      suggest 3-5 improvements or new world building ideas.`;
      
      const response = await processText(aiPrompt, 'improve');
      
      // Basic parsing - return some default suggestions
      return [
        'Add more detailed geography',
        'Develop cultural traditions',
        'Create political systems',
        'Add historical background',
        'Include magical/technological systems'
      ];
    }, 'generate world building suggestions');
  };

  return {
    generateWorldElement,
    improveSuggestions,
    isGenerating
  };
};
