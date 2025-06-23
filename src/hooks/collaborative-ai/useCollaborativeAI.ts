
import { useState } from 'react';
import { AISuggestion, AIContext } from './types';
import { useTextOperations } from './textOperations';
import { useSuggestionOperations } from './suggestionOperations';
import { useVersionOperations } from './versionOperations';

export const useCollaborativeAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [context, setContext] = useState<AIContext>({
    currentText: '',
    cursorPosition: 0,
    selectedText: '',
    characters: []
  });

  const textOps = useTextOperations();
  const suggestionOps = useSuggestionOperations();
  const versionOps = useVersionOperations();

  const improveSelectedText = async (text: string) => {
    setIsProcessing(true);
    try {
      return await textOps.improveSelectedText(text);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTextCompletion = async (textBefore: string, textAfter: string) => {
    setIsProcessing(true);
    try {
      return await textOps.generateTextCompletion(textBefore, textAfter);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateContextualSuggestions = async (
    text: string,
    selectedText?: string,
    characters: string[] = [],
    storyArcs: any[] = []
  ) => {
    setIsProcessing(true);
    try {
      return await suggestionOps.generateContextualSuggestions(text, selectedText, characters, storyArcs);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMultiPerspectiveSuggestions = async (
    text: string, 
    perspective: 'editor' | 'reader' | 'genre'
  ) => {
    setIsProcessing(true);
    try {
      return await suggestionOps.generateMultiPerspectiveSuggestions(text, perspective);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeVersionChanges = async (
    originalText: string,
    currentText: string
  ) => {
    setIsProcessing(true);
    try {
      return await versionOps.analyzeVersionChanges(originalText, currentText);
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
