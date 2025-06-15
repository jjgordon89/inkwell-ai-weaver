
import { useState } from 'react';
import { useAI } from './useAI';
import { WorldElement } from '@/contexts/WritingContext';

export const useWorldBuildingAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorldElement = async (prompt: string, type: WorldElement['type']): Promise<Partial<WorldElement>> => {
    setIsGenerating(true);
    
    try {
      const enhancedPrompt = `Create a detailed world building element of type "${type}" based on this description: "${prompt}". 
      Please provide the world element details in the following format:
      Name: [element name]
      Description: [detailed description of the ${type} including its significance, characteristics, and role in the world]
      
      Make the ${type} engaging and well-developed for a compelling fictional world.`;

      const result = await processText(enhancedPrompt, 'improve');
      
      // Parse the AI response to extract world element data
      const worldElementData = parseWorldElementResponse(result);
      
      return {
        ...worldElementData,
        type,
        id: Date.now().toString()
      };
    } catch (error) {
      console.error('Failed to generate world element:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const parseWorldElementResponse = (response: string): Partial<WorldElement> => {
    const lines = response.split('\n');
    const worldElement: Partial<WorldElement> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key.toLowerCase().trim()) {
        case 'name':
          worldElement.name = value;
          break;
        case 'description':
          worldElement.description = value;
          break;
      }
    });

    return worldElement;
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
      
      // Split the response into individual suggestions
      const suggestions = result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10);
      
      return suggestions.slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.error('Failed to generate improvement suggestions:', error);
      throw error;
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
