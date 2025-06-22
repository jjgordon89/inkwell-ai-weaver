
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAI } from './useAI';
import { useWriting } from '@/contexts/WritingContext';
import { useDebounce } from './useDebounce';

interface AISuggestion {
  id: string;
  type: 'completion' | 'improvement' | 'character' | 'plot';
  text: string;
  confidence: number;
  position?: { start: number; end: number };
  original?: string;
}

interface WritingContext {
  currentText: string;
  cursorPosition: number;
  selectedText: string;
  characters: string[];
  currentChapter?: string;
}

export const useCollaborativeAI = () => {
  const { processText, isProcessing } = useAI();
  const { state } = useWriting();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [writingContext, setWritingContext] = useState<WritingContext>({
    currentText: '',
    cursorPosition: 0,
    selectedText: '',
    characters: []
  });

  const debouncedText = useDebounce(writingContext.currentText, 2000);
  const analysisRef = useRef<AbortController | null>(null);

  const analyzeWritingContext = useCallback(async (context: WritingContext) => {
    if (!context.currentText || context.currentText.length < 50) return;

    // Cancel previous analysis
    if (analysisRef.current) {
      analysisRef.current.abort();
    }
    analysisRef.current = new AbortController();

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this writing context and provide helpful suggestions:

Current text: "${context.currentText.slice(-500)}"
Characters mentioned: ${context.characters.join(', ')}

Provide 2-3 contextual suggestions for:
1. Writing flow improvements
2. Character development opportunities
3. Plot advancement ideas

Format as: Type: suggestion text (confidence: 0-100)`;

      const result = await processText(prompt, 'context-suggestion');
      
      // Parse suggestions
      const newSuggestions: AISuggestion[] = [];
      const lines = result.split('\n').filter(line => line.trim());
      
      lines.forEach((line, index) => {
        const match = line.match(/^(\w+):\s*(.+?)\s*\(confidence:\s*(\d+)\)/);
        if (match) {
          const [, type, text, confidence] = match;
          newSuggestions.push({
            id: `suggestion-${Date.now()}-${index}`,
            type: type.toLowerCase() as AISuggestion['type'],
            text: text.trim(),
            confidence: parseInt(confidence, 10)
          });
        }
      });

      if (!analysisRef.current.signal.aborted) {
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      if (!analysisRef.current?.signal.aborted) {
        console.error('Context analysis failed:', error);
      }
    } finally {
      setIsAnalyzing(false);
      analysisRef.current = null;
    }
  }, [processText]);

  const generateTextCompletion = useCallback(async (textBefore: string, textAfter: string) => {
    if (textBefore.length < 10) return null;

    try {
      const prompt = `Complete this text naturally, maintaining the style and flow:

Before: "${textBefore.slice(-200)}"
After: "${textAfter.slice(0, 100)}"

Provide a natural completion (2-10 words) that bridges the text smoothly:`;

      const completion = await processText(prompt, 'continue-story');
      return completion.trim();
    } catch (error) {
      console.error('Text completion failed:', error);
      return null;
    }
  }, [processText]);

  const improveSelectedText = useCallback(async (selectedText: string) => {
    if (!selectedText || selectedText.length < 5) return null;

    try {
      const result = await processText(selectedText, 'improve');
      return {
        id: `improvement-${Date.now()}`,
        type: 'improvement' as const,
        text: result,
        confidence: 85,
        original: selectedText
      };
    } catch (error) {
      console.error('Text improvement failed:', error);
      return null;
    }
  }, [processText]);

  // Auto-analyze when text changes
  useEffect(() => {
    if (debouncedText) {
      analyzeWritingContext(writingContext);
    }
  }, [debouncedText, analyzeWritingContext, writingContext]);

  // Update context when writing state changes
  useEffect(() => {
    setWritingContext({
      currentText: state.currentDocument?.content || '',
      cursorPosition: 0,
      selectedText: state.selectedText,
      characters: state.characters.map(c => c.name),
      currentChapter: state.currentDocument?.title
    });
  }, [state.currentDocument, state.selectedText, state.characters]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  const clearAllSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isAnalyzing: isAnalyzing || isProcessing,
    writingContext,
    generateTextCompletion,
    improveSelectedText,
    dismissSuggestion,
    clearAllSuggestions,
    updateContext: setWritingContext
  };
};
