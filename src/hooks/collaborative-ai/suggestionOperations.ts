
import { useAI } from '@/hooks/useAI';

export const useSuggestionOperations = () => {
  const { processText } = useAI();

  const generateContextualSuggestions = async (
    text: string,
    selectedText?: string,
    characters: string[] = [],
    storyArcs: any[] = []
  ): Promise<string[]> => {
    if (!text || text.trim().length === 0) return [];

    try {
      const prompt = `Analyze this text and provide contextual writing suggestions: "${text}"`;
      const result = await processText(prompt, 'analyze-tone');
      
      // Parse the result into individual suggestions
      return result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10)
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to generate contextual suggestions:', error);
      return [];
    }
  };

  const generateMultiPerspectiveSuggestions = async (
    text: string, 
    perspective: 'editor' | 'reader' | 'genre'
  ): Promise<string[]> => {
    if (!text || text.trim().length === 0) return [];

    try {
      let prompt = '';
      
      switch (perspective) {
        case 'editor':
          prompt = `As a professional editor, analyze this text and provide 3-4 specific improvement suggestions: "${text}"`;
          break;
        case 'reader':
          prompt = `As an average reader, evaluate this text for engagement and understanding. Provide 3-4 suggestions: "${text}"`;
          break;
        case 'genre':
          prompt = `As a genre expert, analyze this text for genre conventions and appeal. Provide 3-4 suggestions: "${text}"`;
          break;
      }

      const result = await processText(prompt, 'analyze-tone');
      
      // Parse the result into individual suggestions
      return result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10)
        .slice(0, 4);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  };

  return {
    generateContextualSuggestions,
    generateMultiPerspectiveSuggestions
  };
};
