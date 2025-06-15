
import { useState } from 'react';
import { useAI } from './useAI';
import { StoryArc } from '@/contexts/WritingContext';
import { parseAIResponse, handleAIError, validateAIInput, createSuggestionsList } from './ai/aiUtils';

export const useStoryArcAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStoryArc = async (prompt: string): Promise<Partial<StoryArc>> => {
    setIsGenerating(true);
    
    try {
      validateAIInput(prompt, 'story arc generation');

      const enhancedPrompt = `Create a detailed story arc based on this description: "${prompt}". 
      Please provide the story arc details in the following format:
      Title: [story arc title]
      Description: [detailed description of the story arc including key plot points, character development, and narrative progression]
      
      Make the story arc engaging and well-structured for a compelling narrative.`;

      const result = await processText(enhancedPrompt, 'improve');
      const parsedData = parseAIResponse(result);
      
      return {
        id: Date.now().toString(),
        title: parsedData.title as string,
        description: parsedData.description as string,
        completed: false
      };
    } catch (error) {
      throw handleAIError(error, 'generate story arc');
    } finally {
      setIsGenerating(false);
    }
  };

  const improveSuggestions = async (currentArcs: StoryArc[]): Promise<string[]> => {
    setIsGenerating(true);
    
    try {
      const arcsContext = currentArcs.map(arc => `${arc.title}: ${arc.description}`).join('\n');
      const prompt = `Based on these existing story arcs:
${arcsContext}

Suggest 3-5 potential improvements or new story arc ideas that would enhance the overall narrative structure. Focus on:
- Plot progression and pacing
- Character development opportunities
- Thematic coherence
- Conflict escalation
- Resolution paths

Provide each suggestion as a brief, actionable recommendation.`;

      const result = await processText(prompt, 'improve');
      return createSuggestionsList(result);
    } catch (error) {
      throw handleAIError(error, 'generate improvement suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateStoryArc,
    improveSuggestions,
    isGenerating: isGenerating || isProcessing
  };
};
