
import { WritingMetrics } from '@/hooks/ai/types';

export interface SmartWritingHandlers {
  onAnalyze: () => Promise<void>;
  onGenerateAutoSuggestions: () => Promise<void>;
  onPredictNextWords: () => Promise<void>;
  onGrammarCheck: () => Promise<void>;
}

export interface SmartWritingState {
  metrics: WritingMetrics | null;
  autoSuggestions: string[];
  nextWordPredictions: string[];
}

export const createAnalyzeHandler = (
  analyzeWritingQuality: (content: string) => Promise<WritingMetrics>,
  currentContent: string | undefined,
  setMetrics: (metrics: WritingMetrics) => void,
  toast: (options: any) => void
) => async (): Promise<void> => {
  if (!currentContent) return;
  
  try {
    const result = await analyzeWritingQuality(currentContent);
    setMetrics(result);
    toast({
      title: "Analysis Complete",
      description: `Text analyzed with ${result.readability.level.toLowerCase()} readability.`,
    });
  } catch (error) {
    console.error("Failed to analyze text:", error);
    toast({
      title: "Error",
      description: "Failed to analyze writing quality.",
      variant: "destructive",
    });
  }
};

export const createSuggestionsHandler = (
  generateContextualSuggestions: (content: string) => Promise<string[]>,
  currentContent: string | undefined,
  setAutoSuggestions: (suggestions: string[]) => void,
  toast: (options: any) => void
) => async (): Promise<void> => {
  if (!currentContent) return;
  
  try {
    const suggestions = await generateContextualSuggestions(currentContent);
    setAutoSuggestions(suggestions);
    if (suggestions.length > 0) {
      toast({ title: "Suggestions refreshed!" });
    }
  } catch (error) {
    console.error("Failed to generate suggestions:", error);
    toast({
      title: "Error",
      description: "Failed to generate suggestions.",
      variant: "destructive",
    });
  }
};

export const createPredictWordsHandler = (
  predictNextWords: (content: string) => Promise<string[]>,
  currentContent: string | undefined,
  setNextWordPredictions: (words: string[]) => void,
  toast: (options: any) => void
) => async (): Promise<void> => {
  if (!currentContent) return;
  
  try {
    const words = await predictNextWords(currentContent);
    setNextWordPredictions(words);
    if (words.length > 0) {
      toast({ title: "Next word predictions updated." });
    }
  } catch (error) {
    console.error("Failed to predict next words:", error);
    toast({
      title: "Error",
      description: "Failed to predict next words.",
      variant: "destructive",
    });
  }
};

export const createGrammarCheckHandler = (
  processText: (content: string, action: string) => Promise<string>,
  currentDocument: any,
  dispatch: (action: any) => void,
  toast: (options: any) => void
) => async (): Promise<void> => {
  if (!currentDocument || !currentDocument.content) return;
  
  const originalContent = currentDocument.content;
  toast({ title: "Checking grammar..." });
  
  try {
    const fixedContent = await processText(originalContent, 'fix-grammar');
    if (fixedContent !== originalContent) {
      dispatch({ 
        type: 'UPDATE_DOCUMENT_CONTENT', 
        payload: { id: currentDocument.id, content: fixedContent }
      });
      toast({
        title: "Grammar Check Complete",
        description: "Grammar and spelling have been corrected.",
      });
    } else {
      toast({
        title: "Grammar Check Complete",
        description: "No errors found.",
      });
    }
  } catch (error) {
    console.error("Grammar check failed:", error);
    toast({
      title: "Error",
      description: "Failed to perform grammar check.",
      variant: "destructive",
    });
  }
};
