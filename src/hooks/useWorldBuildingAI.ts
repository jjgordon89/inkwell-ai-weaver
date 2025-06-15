
import { useState } from 'react';
import { useAI } from './useAI';
import { WorldElement } from '@/contexts/WritingContext';
import { parseAIResponse, handleAIError, validateAIInput, createSuggestionsList } from './ai/aiUtils';

export const useWorldBuildingAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorldElement = async (prompt: string, type: WorldElement['type']): Promise<Partial<WorldElement>> => {
    setIsGenerating(true);
    
    try {
      validateAIInput(prompt, 'world element generation');

      const enhancedPrompt = `Create a detailed world building element of type "${type}" based on this description: "${prompt}". 
      Please provide the world element details in the following format:
      Name: [element name]
      Description: [detailed description of the ${type} including its significance, characteristics, and role in the world]
      
      Make the ${type} engaging and well-developed for a compelling fictional world.`;

      const result = await processText(enhancedPrompt, 'improve');
      const parsedData = parseAIResponse(result);
      
      return {
        type,
        id: Date.now().toString(),
        name: parsedData.name as string,
        description: parsedData.description as string
      };
    } catch (error) {
      throw handleAIError(error, 'generate world element');
    } finally {
      setIsGenerating(false);
    }
  };

  const improveSuggestions = async (currentElements: WorldElement[]): Promise<string[]> => {
    setIsGenerating(true);
    
    try {
      const elementsContext = currentElements.map(element => `${element.type}: ${element.name} - ${element.description}`).join('\n');
      const prompt = `Based on these existing world building elements:
${elementsContext}

Suggest 3-5 potential improvements or new world building ideas that would enhance the overall world consistency and depth. Focus on:
- World consistency and coherence
- Missing elements that would enrich the world
- Connections between existing elements
- Cultural and historical depth
- Environmental and geographical considerations

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
    generateWorldElement,
    improveSuggestions,
    isGenerating: isGenerating || isProcessing
  };
};
