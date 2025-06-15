
import { useState } from 'react';
import { useAI } from './useAI';
import { ToneAnalysis, PlotElement, WritingPrompt } from './ai/types';
import { parseAIResponse, handleAIError, validateAIInput, createSuggestionsList } from './ai/aiUtils';

export const useEnhancedAI = () => {
  const { processText, isProcessing } = useAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Context-aware AI suggestions
  const generateContextualSuggestions = async (
    documentContent: string,
    selectedText?: string,
    characters?: any[],
    storyArcs?: any[]
  ): Promise<string[]> => {
    setIsAnalyzing(true);
    
    try {
      validateAIInput(documentContent, 'contextual suggestions');

      const context = {
        content: documentContent.substring(0, 2000), // Limit context length
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

  // Tone and style analysis
  const analyzeToneAndStyle = async (text: string): Promise<ToneAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      validateAIInput(text, 'tone analysis');

      const prompt = `Analyze the tone and style of this text:
"${text}"

Provide analysis in this format:
Tone: [primary tone - e.g., dark, hopeful, mysterious, humorous]
Confidence: [confidence level 0-100]
Style Notes: [writing style observations]
Suggestions: [3-4 specific suggestions for tone consistency or improvement]

Focus on emotional resonance, voice consistency, and narrative tone.`;

      const result = await processText(prompt, 'analyze-tone');
      const parsed = parseAIResponse(result);
      
      return {
        tone: parsed.tone as string || 'neutral',
        confidence: parseInt(parsed.confidence as string) || 70,
        suggestions: parsed.suggestions ? 
          (parsed.suggestions as string).split('\n').filter(s => s.trim().length > 0) : 
          []
      };
    } catch (error) {
      throw handleAIError(error, 'analyze tone and style');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Plot generation and story continuation
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

  // Story continuation
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

  // Writing prompts and exercises
  const generateWritingPrompt = async (
    genre?: string,
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    type?: 'character' | 'setting' | 'conflict' | 'theme'
  ): Promise<WritingPrompt> => {
    setIsGenerating(true);
    
    try {
      const prompt = `Create a creative writing prompt with these specifications:
Genre: ${genre || 'any'}
Difficulty: ${difficulty || 'intermediate'}
Focus: ${type || 'general'}

Format:
Title: [engaging title]
Prompt: [detailed writing prompt with specific elements to include]
Genre: [specific genre]
Difficulty: [difficulty level]

Make it inspiring and specific enough to spark creativity.`;

      const result = await processText(prompt, 'writing-prompt');
      const parsed = parseAIResponse(result);
      
      return {
        id: Date.now().toString(),
        title: parsed.title as string || 'Writing Exercise',
        prompt: parsed.prompt as string || result,
        genre: parsed.genre as string || genre || 'general',
        difficulty: parsed.difficulty as WritingPrompt['difficulty'] || difficulty || 'intermediate'
      };
    } catch (error) {
      throw handleAIError(error, 'generate writing prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    // Context-aware suggestions
    generateContextualSuggestions,
    
    // Analysis tools
    analyzeToneAndStyle,
    
    // Plot development
    generatePlotElements,
    continueStory,
    
    // Writing exercises
    generateWritingPrompt,
    
    // State
    isAnalyzing: isAnalyzing || isProcessing,
    isGenerating: isGenerating || isProcessing
  };
};
