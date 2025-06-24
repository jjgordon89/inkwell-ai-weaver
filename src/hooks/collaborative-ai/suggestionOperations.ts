
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
      const prompt = `Analyze this text and provide 3-5 specific, actionable writing suggestions. Return ONLY the suggestions as a bulleted list without introductions or explanations: "${text}"`;
      const result = await processText(prompt, 'analyze-tone');
      
      // Parse the result into clean suggestions
      return result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10 && !suggestion.toLowerCase().includes('here are') && !suggestion.toLowerCase().includes('suggestions:'))
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
          prompt = `As a professional editor, provide 3-4 specific improvement suggestions for this text. Return ONLY the suggestions without introductions: "${text}"`;
          break;
        case 'reader':
          prompt = `As an average reader, provide 3-4 suggestions to improve engagement and clarity. Return ONLY the suggestions: "${text}"`;
          break;
        case 'genre':
          prompt = `As a genre expert, provide 3-4 suggestions for genre conventions and appeal. Return ONLY the suggestions: "${text}"`;
          break;
      }

      const result = await processText(prompt, 'analyze-tone');
      
      // Parse and clean the suggestions
      return result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10 && !suggestion.toLowerCase().includes('here are') && !suggestion.toLowerCase().includes('suggestions:'))
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
