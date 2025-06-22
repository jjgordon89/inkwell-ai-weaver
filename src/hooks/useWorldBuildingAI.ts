
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { WorldElement } from '@/contexts/WritingContext';

export const useWorldBuildingAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorldElement = async (prompt: string, type: WorldElement['type']): Promise<Partial<WorldElement>> => {
    setIsGenerating(true);
    try {
      const aiPrompt = `Create a ${type} for world building based on: "${prompt}".
        Respond with a JSON object containing:
        - name: A compelling name
        - description: Rich, detailed description that includes significance, connections to other elements, and specific details
        
        Make it vivid and useful for a writer's world building.`;
      
      const result = await processText(aiPrompt, 'expand');
      
      try {
        const parsed = JSON.parse(result);
        return {
          type,
          name: parsed.name || `${type}: ${prompt.substring(0, 20)}...`,
          description: parsed.description || result
        };
      } catch {
        return {
          type,
          name: `${type}: ${prompt.substring(0, 20)}...`,
          description: result
        };
      }
    } catch (error) {
      console.error('Failed to generate world element:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const improveSuggestions = async (currentElements: WorldElement[]): Promise<string[]> => {
    setIsGenerating(true);
    try {
      const elementsContext = currentElements.map(el => `${el.name} (${el.type}): ${el.description}`).join('\n');
      const aiPrompt = `Based on these world building elements:
        ${elementsContext}
        
        Suggest 3-5 ways to enhance the world building, add depth, or create interesting connections. 
        Focus on elements that would make the world more immersive and coherent.`;
      
      const result = await processText(aiPrompt, 'improve');
      return result.split('\n').filter(line => line.trim().length > 10).slice(0, 5);
    } catch (error) {
      console.error('Failed to generate world building suggestions:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWorldElement,
    improveSuggestions,
    isGenerating
  };
};
