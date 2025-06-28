import { useState, useCallback } from 'react';
import { AISuggestion } from '../types/ai';

export const useCollaborativeAI = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTextCompletion = useCallback(async (textBefore: string, textAfter: string) => {
    setIsGenerating(true);
    try {
      // Mock AI completion
      await new Promise(resolve => setTimeout(resolve, 800));
      return `This is where AI would continue the text based on: "${textBefore.slice(-50)}..."`;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const improveSelectedText = useCallback(async (selectedText: string) => {
    setIsGenerating(true);
    try {
      // Mock improvement
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        text: `Improved: ${selectedText}`,
        confidence: 0.85
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const addSuggestion = useCallback((suggestion: Omit<AISuggestion, 'id'>) => {
    const newSuggestion: AISuggestion = {
      ...suggestion,
      id: crypto.randomUUID()
    };
    setSuggestions(prev => [...prev, newSuggestion]);
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateContext = useCallback((context: string) => {
    // Mock context-aware suggestion generation
    if (context.length > 100 && Math.random() > 0.7) {
      addSuggestion({
        text: "Consider breaking this into smaller paragraphs for better readability.",
        type: 'improvement',
        confidence: 0.75
      });
    }
  }, [addSuggestion]);

  return {
    suggestions,
    isGenerating,
    generateTextCompletion,
    improveSelectedText,
    addSuggestion,
    dismissSuggestion,
    updateContext
  };
};
