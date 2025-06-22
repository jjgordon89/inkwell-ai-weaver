
import { useState } from 'react';
import { useAI } from '../useAI';
import { PlotElement } from './types';
import { validateAIInput, handleAIError } from './aiUtils';

export const useStoryGeneration = () => {
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlotElements = async (
    currentStory: string,
    genre?: string,
    targetLength?: 'short' | 'medium' | 'long'
  ): Promise<PlotElement[]> => {
    setIsGenerating(true);
    
    try {
      validateAIInput(currentStory, 'plot generation');

      const prompt = `Based on this story so far:
"${currentStory.substring(0, 1500)}"

Genre: ${genre || 'general fiction'}
Target length: ${targetLength || 'medium'}

Generate 4-6 plot elements that could enhance this narrative:

Format each as:
Type: [conflict/twist/resolution/character-development]
Description: [detailed description]
Placement: [beginning/middle/end]

Focus on creating compelling narrative progression and character growth.`;

      const result = await processText(prompt, 'generate-plot');
      const lines = result.split('\n').filter(line => line.trim().length > 0);
      
      const plotElements: PlotElement[] = [];
      let currentElement: Partial<PlotElement> = {};
      
      lines.forEach(line => {
        if (line.startsWith('Type:')) {
          if (currentElement.type) {
            plotElements.push(currentElement as PlotElement);
          }
          currentElement = { type: line.split(':')[1].trim() as PlotElement['type'] };
        } else if (line.startsWith('Description:')) {
          currentElement.description = line.split(':')[1].trim();
        } else if (line.startsWith('Placement:')) {
          currentElement.placement = line.split(':')[1].trim() as PlotElement['placement'];
        }
      });
      
      if (currentElement.type) {
        plotElements.push(currentElement as PlotElement);
      }
      
      return plotElements;
    } catch (error) {
      throw handleAIError(error, 'generate plot elements');
    } finally {
      setIsGenerating(false);
    }
  };

  const continueStory = async (
    currentText: string,
    direction?: 'action' | 'dialogue' | 'description' | 'introspection'
  ): Promise<string> => {
    setIsGenerating(true);
    
    try {
      validateAIInput(currentText, 'story continuation');

      const prompt = `Continue this story naturally, focusing on ${direction || 'natural progression'}:

"${currentText}"

Write 2-3 paragraphs that:
- Maintain the established tone and style
- Advance the plot or develop characters
- Keep consistent with the narrative voice
- Create engaging, readable content

Continue seamlessly from where the text ends.`;

      const result = await processText(prompt, 'continue-story');
      return result;
    } catch (error) {
      throw handleAIError(error, 'continue story');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePlotElements,
    continueStory,
    isGenerating: isGenerating || isProcessing
  };
};
