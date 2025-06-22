
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { StoryArc } from '@/contexts/WritingContext';

export const useStoryArcAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStoryArc = async (prompt: string): Promise<Partial<StoryArc>> => {
    setIsGenerating(true);
    try {
      const aiPrompt = `Create a story arc based on this description: "${prompt}". 
        Respond with a JSON object containing:
        - title: A compelling title for the arc
        - description: A detailed description of the arc
        - events: An array of 3-5 key events in this arc
        - characterDevelopment: How main characters develop in this arc
        - themes: Main themes explored
        
        Keep it concise but meaningful for a writer's planning.`;
      
      const result = await processText(aiPrompt, 'improve');
      
      try {
        const parsed = JSON.parse(result);
        return parsed;
      } catch {
        return {
          title: `Story Arc: ${prompt.substring(0, 30)}...`,
          description: result,
          events: [],
          characterDevelopment: '',
          themes: []
        };
      }
    } catch (error) {
      console.error('Failed to generate story arc:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const improveSuggestions = async (currentArcs: StoryArc[]): Promise<string[]> => {
    setIsGenerating(true);
    try {
      const arcsContext = currentArcs.map(arc => `${arc.title}: ${arc.description}`).join('\n');
      const aiPrompt = `Based on these existing story arcs:
        ${arcsContext}
        
        Suggest 3-5 ways to improve the narrative structure, add compelling arcs, or enhance character development. 
        Each suggestion should be a complete sentence that a writer can immediately act on.`;
      
      const result = await processText(aiPrompt, 'improve');
      return result.split('\n').filter(line => line.trim().length > 10).slice(0, 5);
    } catch (error) {
      console.error('Failed to generate improvement suggestions:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateStoryArc,
    improveSuggestions,
    isGenerating
  };
};
