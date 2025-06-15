
import { useState } from 'react';
import { useAI } from './useAI';
import { StoryArc } from '@/contexts/WritingContext';

export const useStoryArcAI = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStoryArc = async (prompt: string): Promise<Partial<StoryArc>> => {
    setIsGenerating(true);
    
    try {
      const enhancedPrompt = `Create a detailed story arc based on this description: "${prompt}". 
      Please provide the story arc details in the following format:
      Title: [story arc title]
      Description: [detailed description of the story arc including key plot points, character development, and narrative progression]
      
      Make the story arc engaging and well-structured for a compelling narrative.`;

      const result = await processText(enhancedPrompt, 'improve');
      
      // Parse the AI response to extract story arc data
      const storyArcData = parseStoryArcResponse(result);
      
      return {
        ...storyArcData,
        id: Date.now().toString(),
        completed: false
      };
    } catch (error) {
      console.error('Failed to generate story arc:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const parseStoryArcResponse = (response: string): Partial<StoryArc> => {
    const lines = response.split('\n');
    const storyArc: Partial<StoryArc> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key.toLowerCase().trim()) {
        case 'title':
          storyArc.title = value;
          break;
        case 'description':
          storyArc.description = value;
          break;
      }
    });

    return storyArc;
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
    generateStoryArc,
    improveSuggestions,
    isGenerating: isGenerating || isProcessing
  };
};
