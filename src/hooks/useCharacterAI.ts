
import { useState } from 'react';
import { useAI } from './useAI';
import { useAsyncOperation } from './useAsyncOperation';
import { Character } from '@/contexts/WritingContext';

export const useCharacterAI = () => {
  const { processText, isCurrentProviderConfigured } = useAI();
  const { execute, isLoading: isGenerating } = useAsyncOperation();

  const generateCharacter = async (prompt: string): Promise<Partial<Character>> => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured. Please configure your AI provider in the AI Assistance settings.');
    }

    const result = await execute(async () => {
      const aiPrompt = `Generate a detailed character based on this description: "${prompt}". 
      
      Please provide a character with the following details:
      - Name: A fitting name for the character
      - Description: A brief overview of the character
      - Age: An appropriate age
      - Occupation: What they do for work or their role
      - Appearance: Physical description
      - Personality: Key personality traits
      - Backstory: Brief background story
      - Tags: Relevant character tags
      
      Make the character well-developed and interesting for a story.`;
      
      const response = await processText(aiPrompt, 'improve');
      
      // Try to parse the AI response into character fields
      const lines = response.split('\n').filter(line => line.trim());
      const characterData: Partial<Character> = {
        name: 'Generated Character',
        description: response,
        age: 25,
        occupation: 'Unknown',
        appearance: 'To be determined',
        personality: 'Interesting personality',
        backstory: 'Rich backstory',
        tags: ['ai-generated'],
        createdWith: 'ai' as const
      };

      // Simple parsing to extract structured data if available
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('name:')) {
          const nameMatch = line.match(/name:\s*(.+)/i);
          if (nameMatch) characterData.name = nameMatch[1].trim();
        } else if (lowerLine.includes('age:')) {
          const ageMatch = line.match(/age:\s*(\d+)/i);
          if (ageMatch) characterData.age = parseInt(ageMatch[1]);
        } else if (lowerLine.includes('occupation:')) {
          const occupationMatch = line.match(/occupation:\s*(.+)/i);
          if (occupationMatch) characterData.occupation = occupationMatch[1].trim();
        } else if (lowerLine.includes('appearance:')) {
          const appearanceMatch = line.match(/appearance:\s*(.+)/i);
          if (appearanceMatch) characterData.appearance = appearanceMatch[1].trim();
        } else if (lowerLine.includes('personality:')) {
          const personalityMatch = line.match(/personality:\s*(.+)/i);
          if (personalityMatch) characterData.personality = personalityMatch[1].trim();
        } else if (lowerLine.includes('backstory:')) {
          const backstoryMatch = line.match(/backstory:\s*(.+)/i);
          if (backstoryMatch) characterData.backstory = backstoryMatch[1].trim();
        }
      });
      
      return characterData;
    }, 'generate character');

    return result || {
      name: 'Generated Character',
      description: 'AI-generated character',
      age: 25,
      occupation: 'Unknown',
      appearance: 'To be determined',
      personality: 'Interesting personality',
      backstory: 'Rich backstory',
      tags: ['ai-generated'],
      createdWith: 'ai' as const
    };
  };

  return {
    generateCharacter,
    isGenerating
  };
};
