
import { useAI } from '@/hooks/useAI';
import { TextImprovement } from './types';

export const useTextOperations = () => {
  const { processText } = useAI();

  const improveSelectedText = async (text: string): Promise<TextImprovement | null> => {
    if (!text || text.trim().length === 0) return null;

    try {
      const improvedText = await processText(text, 'improve');
      
      // Calculate confidence based on text length and complexity
      const confidence = Math.min(95, Math.max(70, 80 + (text.length / 100) * 5));
      
      return {
        text: improvedText,
        confidence: Math.round(confidence),
        reason: 'Improved clarity and flow'
      };
    } catch (error) {
      console.error('Failed to improve text:', error);
      return null;
    }
  };

  const generateTextCompletion = async (textBefore: string, textAfter: string): Promise<string | null> => {
    if (!textBefore || textBefore.trim().length === 0) return null;

    try {
      const completion = await processText(textBefore, 'improve');
      return completion;
    } catch (error) {
      console.error('Failed to generate text completion:', error);
      return null;
    }
  };

  return {
    improveSelectedText,
    generateTextCompletion
  };
};
