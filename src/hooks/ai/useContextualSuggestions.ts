
import { useState } from 'react';
import { useAI } from '../useAI';
import { validateAIInput, handleAIError, createSuggestionsList } from './aiUtils';

export const useContextualSuggestions = () => {
  const { processText, isProcessing } = useAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateContextualSuggestions = async (
    documentContent: string,
    selectedText?: string,
    characters?: Array<{ id: string; name: string }>,
    storyArcs?: Array<{ id: string; title: string }>
  ): Promise<string[]> => {
    setIsAnalyzing(true);
    
    try {
      validateAIInput(documentContent, 'contextual suggestions');

      const context = {
        content: documentContent.substring(0, 2000),
        selectedText: selectedText || '',
        characterCount: characters?.length || 0,
        storyArcCount: storyArcs?.length || 0,
        wordCount: documentContent.split(' ').length
      };

      const prompt = `Based on this story context:
Content: "${context.content}"
${context.selectedText ? `Selected text: "${context.selectedText}"` : ''}
Characters: ${context.characterCount} defined
Story arcs: ${context.storyArcCount} planned
Word count: ${context.wordCount}

Provide 4-6 context-aware writing suggestions that:
- Enhance the current narrative flow
- Suggest character development opportunities
- Recommend plot advancement strategies
- Identify areas for improved description or dialogue
- Consider pacing and tension

Format as a bulleted list of actionable suggestions.`;

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Contextual suggestions timed out')), 20000);
      });

      const resultPromise = processText(prompt, 'context-suggestion');
      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      return createSuggestionsList(result);
    } catch (error) {
      console.error('Contextual suggestions error:', error);
      // Return fallback suggestions on error
      return [
        'Consider developing character motivations further',
        'Add more dialogue to bring scenes to life',
        'Enhance descriptive details for better immersion',
        'Review pacing - consider varying sentence lengths',
        'Strengthen the conflict or tension in this section'
      ];
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    generateContextualSuggestions,
    isAnalyzing: isAnalyzing || isProcessing
  };
};
