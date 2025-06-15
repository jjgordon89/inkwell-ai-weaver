
import { useState } from 'react';
import { useAI } from './useAI';
import { Character } from '@/contexts/WritingContext';
import { parseAIResponse, handleAIError, validateAIInput } from './ai/aiUtils';

export const useCharacterAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCharacter = async (prompt: string): Promise<Partial<Character>> => {
    setIsGenerating(true);
    
    try {
      validateAIInput(prompt, 'character generation');

      const enhancedPrompt = `Create a detailed character based on this description: "${prompt}". 
      Please provide the character details in the following format:
      Name: [character name]
      Age: [age]
      Occupation: [occupation]
      Appearance: [physical description]
      Personality: [personality traits]
      Backstory: [brief background]
      Description: [general description]
      Tags: [comma-separated relevant tags]
      
      Make the character realistic and well-developed for a story.`;

      const result = await processText(enhancedPrompt, 'improve');
      const parsedData = parseAIResponse(result);
      
      return {
        id: Date.now().toString(),
        name: parsedData.name as string,
        age: parsedData.age as number,
        occupation: parsedData.occupation as string,
        appearance: parsedData.appearance as string,
        personality: parsedData.personality as string,
        backstory: parsedData.backstory as string,
        description: parsedData.description as string,
        tags: parsedData.tags as string[] || [],
        notes: '',
        relationships: [],
        createdWith: 'ai' as const
      };
    } catch (error) {
      throw handleAIError(error, 'generate character');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCharacter,
    isGenerating: isGenerating || isProcessing
  };
};
