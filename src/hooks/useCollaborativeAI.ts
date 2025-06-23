
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';

export interface TextImprovement {
  text: string;
  confidence: number;
  reason: string;
}

export interface AISuggestion {
  id: string;
  text: string;
  original?: string;
  confidence: number;
  type: 'improvement' | 'character' | 'plot' | 'completion';
}

export interface AIContext {
  currentText: string;
  cursorPosition: number;
  selectedText: string;
  characters: string[];
}

export const useCollaborativeAI = () => {
  const { processText } = useAI();
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [context, setContext] = useState<AIContext>({
    currentText: '',
    cursorPosition: 0,
    selectedText: '',
    characters: []
  });

  const improveSelectedText = async (text: string): Promise<TextImprovement | null> => {
    if (!text || text.trim().length === 0) return null;

    setIsProcessing(true);
    try {
      const improvedText = await processText(text, 'improve');
      
      // Calculate confidence based on text length and complexity
      const confidence = Math.min(95, Math.max(70, 80 + (text.length / 100) * 5));
      
      return {
        text: improvedText,
        confidence: Math.round(confidence),
        reason: 'Improved clarity and flow'
      };
    } catch (error) {
      console.error('Failed to improve text:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTextCompletion = async (textBefore: string, textAfter: string): Promise<string | null> => {
    if (!textBefore || textBefore.trim().length === 0) return null;

    setIsProcessing(true);
    try {
      const completion = await processText(textBefore, 'improve'); // Using 'improve' instead of 'continue'
      return completion;
    } catch (error) {
      console.error('Failed to generate text completion:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateContextualSuggestions = async (
    text: string,
    selectedText?: string,
    characters: string[] = [],
    storyArcs: any[] = []
  ): Promise<string[]> => {
    if (!text || text.trim().length === 0) return [];

    setIsProcessing(true);
    try {
      const prompt = `Analyze this text and provide contextual writing suggestions: "${text}"`;
      const result = await processText(prompt, 'analyze-tone');
      
      // Parse the result into individual suggestions
      return result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10)
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to generate contextual suggestions:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMultiPerspectiveSuggestions = async (
    text: string, 
    perspective: 'editor' | 'reader' | 'genre'
  ): Promise<string[]> => {
    if (!text || text.trim().length === 0) return [];

    setIsProcessing(true);
    try {
      let prompt = '';
      
      switch (perspective) {
        case 'editor':
          prompt = `As a professional editor, analyze this text and provide 3-4 specific improvement suggestions: "${text}"`;
          break;
        case 'reader':
          prompt = `As an average reader, evaluate this text for engagement and understanding. Provide 3-4 suggestions: "${text}"`;
          break;
        case 'genre':
          prompt = `As a genre expert, analyze this text for genre conventions and appeal. Provide 3-4 suggestions: "${text}"`;
          break;
      }

      const result = await processText(prompt, 'analyze-tone');
      
      // Parse the result into individual suggestions
      return result
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 10)
        .slice(0, 4);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeVersionChanges = async (
    originalText: string,
    currentText: string
  ): Promise<{
    improvements: number;
    changes: Array<{
      type: 'addition' | 'deletion' | 'modification';
      description: string;
      impact: 'positive' | 'negative' | 'neutral';
    }>;
  }> => {
    setIsProcessing(true);
    try {
      const prompt = `Compare these two text versions and analyze the changes:
        Original: "${originalText}"
        Current: "${currentText}"
        
        Identify specific changes and their impact on the text quality.`;

      await processText(prompt, 'analyze-tone');
      
      // Mock analysis for now - in real implementation this would parse AI response
      const mockChanges = [
        {
          type: 'addition' as const,
          description: 'Added descriptive details',
          impact: 'positive' as const
        },
        {
          type: 'modification' as const,
          description: 'Improved word choice',
          impact: 'positive' as const
        }
      ];

      return {
        improvements: mockChanges.filter(c => c.impact === 'positive').length,
        changes: mockChanges
      };
    } catch (error) {
      console.error('Failed to analyze version changes:', error);
      return { improvements: 0, changes: [] };
    } finally {
      setIsProcessing(false);
    }
  };

  const updateContext = (newContext: Partial<AIContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const clearAllSuggestions = () => {
    setSuggestions([]);
  };

  return {
    // Core state
    isProcessing,
    isAnalyzing: isProcessing, // Alias for backward compatibility
    suggestions,
    context,
    
    // Core functions
    improveSelectedText,
    generateTextCompletion,
    generateContextualSuggestions,
    updateContext,
    dismissSuggestion,
    clearAllSuggestions,
    
    // New collaborative features
    generateMultiPerspectiveSuggestions,
    analyzeVersionChanges
  };
};
