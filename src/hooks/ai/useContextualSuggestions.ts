
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

      const result = await processText(prompt, 'context-suggestion');
      return createSuggestionsList(result);
    } catch (error) {
      throw handleAIError(error, 'generate contextual suggestions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    generateContextualSuggestions,
    isAnalyzing: isAnalyzing || isProcessing
  };
};
