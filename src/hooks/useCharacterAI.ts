
import { useState } from 'react';
import { useAI } from './useAI';
import { useAsyncOperation } from './useAsyncOperation';
import { Character } from '@/contexts/WritingContext';

export const useCharacterAI = () => {
  const { processText, isCurrentProviderConfigured } = useAI();
  const { execute, isLoading: isGenerating } = useAsyncOperation();

  const generateCharacter = async (prompt: string): Promise<Partial<Character>> => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured');
    }

    const result = await execute(async () => {
      const aiPrompt = `Generate a character based on this description: "${prompt}". 
      Provide the response in a structured format with name, description, age, occupation, appearance, personality, backstory, and relevant tags.`;
      
      const response = await processText(aiPrompt, 'improve');
      
      // Basic parsing - in a real implementation this would be more sophisticated
      return {
        name: `Generated Character`,
        description: response || 'AI-generated character',
        age: 25,
        occupation: 'Unknown',
        appearance: 'To be determined',
        personality: 'Interesting personality',
        backstory: 'Rich backstory',
        tags: ['ai-generated'],
        relationships: [],
        createdWith: 'ai' as const
      };
    }, 'generate character');

    // Handle null return from execute
    return result || {
      name: 'Generated Character',
      description: 'AI-generated character',
      age: 25,
      occupation: 'Unknown',
      relationships: [],
      createdWith: 'ai' as const
    };
  };

  return {
    generateCharacter,
    isGenerating
  };
};
