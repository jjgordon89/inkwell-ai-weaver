
import { useState } from 'react';
import { useAI } from './useAI';
import { Character } from '@/contexts/WritingContext';

export const useCharacterAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCharacter = async (prompt: string): Promise<Partial<Character>> => {
    setIsGenerating(true);
    
    try {
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
      
      // Parse the AI response to extract character data
      const characterData = parseCharacterResponse(result);
      
      return {
        ...characterData,
        id: Date.now().toString(),
        notes: '',
        tags: characterData.tags || [],
        relationships: [],
        createdWith: 'ai' as const
      };
    } catch (error) {
      console.error('Failed to generate character:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const parseCharacterResponse = (response: string): Partial<Character> => {
    const lines = response.split('\n');
    const character: Partial<Character> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key.toLowerCase().trim()) {
        case 'name':
          character.name = value;
          break;
        case 'age':
          character.age = parseInt(value) || undefined;
          break;
        case 'occupation':
          character.occupation = value;
          break;
        case 'appearance':
          character.appearance = value;
          break;
        case 'personality':
          character.personality = value;
          break;
        case 'backstory':
          character.backstory = value;
          break;
        case 'description':
          character.description = value;
          break;
        case 'tags':
          character.tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
          break;
      }
    });

    return character;
  };

  return {
    generateCharacter,
    isGenerating: isGenerating || isProcessing
  };
};
