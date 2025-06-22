
import { useState, useCallback } from 'react';
import { useGenreDetection } from './useGenreDetection';

export interface StyleMetrics {
  sentenceLength: 'short' | 'medium' | 'long';
  vocabularyComplexity: 'simple' | 'moderate' | 'complex';
  dialogueFrequency: 'low' | 'high';
  avgSentenceLength: number;
  complexWordRatio: number;
  dialogueRatio: number;
}

export const useWritingStyleAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { detectGenre } = useGenreDetection();

  const analyzeStyle = useCallback(async (text: string): Promise<StyleMetrics | null> => {
    if (!text || text.trim().length < 100) return null;

    setIsAnalyzing(true);

    try {
      // Analyze sentence length patterns
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(' ').length, 0) / sentences.length;
      
      const sentenceLength = avgSentenceLength > 20 ? 'long' : avgSentenceLength > 12 ? 'medium' : 'short';

      // Analyze vocabulary complexity
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const complexWords = words.filter(word => word.length > 8).length;
      const complexWordRatio = complexWords / words.length;
      const vocabularyComplexity = complexWordRatio > 0.15 ? 'complex' : complexWordRatio > 0.08 ? 'moderate' : 'simple';

      // Detect dialogue frequency
      const dialogueMarkers = (text.match(/["']/g) || []).length;
      const dialogueRatio = dialogueMarkers / text.length;
      const dialogueFrequency = dialogueRatio > 0.02 ? 'high' : 'low';

      return {
        sentenceLength,
        vocabularyComplexity,
        dialogueFrequency,
        avgSentenceLength,
        complexWordRatio,
        dialogueRatio
      };
    } catch (error) {
      console.error('Style analysis failed:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getStyleSuggestions = useCallback((metrics: StyleMetrics): string[] => {
    const suggestions: string[] = [];

    if (metrics.sentenceLength === 'short') {
      suggestions.push('Your concise style works well here - consider maintaining this rhythm');
    } else if (metrics.sentenceLength === 'long') {
      suggestions.push('Consider breaking some longer sentences for better readability');
    }

    if (metrics.dialogueFrequency === 'high') {
      suggestions.push('Your dialogue-heavy style is engaging - consider balancing with action');
    }

    if (metrics.vocabularyComplexity === 'complex') {
      suggestions.push('Your rich vocabulary adds depth - ensure clarity for readers');
    }

    return suggestions;
  }, []);

  return {
    analyzeStyle,
    getStyleSuggestions,
    isAnalyzing
  };
};
