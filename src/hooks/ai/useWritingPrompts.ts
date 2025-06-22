
import { useState } from 'react';
import { useAI } from '../useAI';
import { WritingPrompt } from './types';
import { parseAIResponse, validateAIInput, handleAIError } from './aiUtils';

export const useWritingPrompts = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWritingPrompt = async (
    genre?: string,
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    type?: 'character' | 'setting' | 'conflict' | 'theme'
  ): Promise<WritingPrompt> => {
    setIsGenerating(true);
    
    try {
      const prompt = `Create a creative writing prompt with these specifications:
Genre: ${genre || 'any'}
Difficulty: ${difficulty || 'intermediate'}
Focus: ${type || 'general'}

Format:
Title: [engaging title]
Prompt: [detailed writing prompt with specific elements to include]
Genre: [specific genre]
Difficulty: [difficulty level]

Make it inspiring and specific enough to spark creativity.`;

      const result = await processText(prompt, 'writing-prompt');
      const parsed = parseAIResponse(result);
      
      return {
        id: Date.now().toString(),
        title: parsed.title as string || 'Writing Exercise',
        prompt: parsed.prompt as string || result,
        genre: parsed.genre as string || genre || 'general',
        difficulty: parsed.difficulty as WritingPrompt['difficulty'] || difficulty || 'intermediate'
      };
    } catch (error) {
      throw handleAIError(error, 'generate writing prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const predictNextWords = async (currentText: string): Promise<string[]> => {
    setIsGenerating(true);
    try {
      validateAIInput(currentText, 'predict next words');
      const result = await processText(currentText.slice(-500), 'predict-next-words');
      return result.split(',').map(w => w.trim()).filter(Boolean);
    } catch (error) {
      throw handleAIError(error, 'predict next words');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWritingPrompt,
    predictNextWords,
    isGenerating: isGenerating || isProcessing
  };
};
