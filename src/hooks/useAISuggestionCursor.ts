import { useCallback, useRef } from 'react';
import { useCursorPositioning } from './useCursorPositioning';

interface AISuggestionCursorOptions {
  textareaRef: React.RefObject<any>;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const useAISuggestionCursor = ({ textareaRef, onContentChange }: AISuggestionCursorOptions) => {
  const suggestionHistoryRef = useRef<Array<{
    originalPosition: number;
    suggestionLength: number;
    timestamp: number;
  }>>([]);

  const { setCursorPosition, getCursorLineInfo } = useCursorPositioning({ textareaRef });

  const applySuggestionWithOptimalCursor = useCallback((
    suggestion: string,
    suggestionType: 'completion' | 'replacement' | 'insertion' = 'completion'
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const originalPosition = textarea.selectionStart;
    const originalContent = textarea.value;
    
    let newContent = '';
    let optimalCursorPosition = 0;
    
    switch (suggestionType) {
      case 'completion':
        // For text completions, append and position cursor at the end
        newContent = originalContent.slice(0, originalPosition) + suggestion + originalContent.slice(originalPosition);
        optimalCursorPosition = originalPosition + suggestion.length;
        
        // If suggestion ends with punctuation, move cursor after any following space
        if (suggestion.match(/[.!?]$/)) {
          const nextChar = originalContent.charAt(originalPosition);
          if (nextChar === ' ') {
            optimalCursorPosition = originalPosition + suggestion.length + 1;
          }
        }
        break;
        
      case 'replacement':
        // For replacements, replace selected text
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        newContent = originalContent.slice(0, start) + suggestion + originalContent.slice(end);
        optimalCursorPosition = start + suggestion.length;
        break;
        
      case 'insertion':
        // For insertions, add at cursor position with smart spacing
        const beforeText = originalContent.slice(Math.max(0, originalPosition - 5), originalPosition);
        const afterText = originalContent.slice(originalPosition, originalPosition + 5);
        
        let finalSuggestion = suggestion;
        
        // Smart spacing logic
        if (beforeText.match(/\w$/) && !suggestion.startsWith(' ')) {
          finalSuggestion = ' ' + suggestion;
        }
        if (afterText.match(/^\w/) && !suggestion.endsWith(' ')) {
          finalSuggestion = finalSuggestion + ' ';
        }
        
        newContent = originalContent.slice(0, originalPosition) + finalSuggestion + originalContent.slice(originalPosition);
        optimalCursorPosition = originalPosition + finalSuggestion.length;
        break;
    }
    
    // Record suggestion in history
    suggestionHistoryRef.current.push({
      originalPosition,
      suggestionLength: suggestion.length,
      timestamp: Date.now()
    });
    
    // Keep only recent history (last 10 suggestions)
    if (suggestionHistoryRef.current.length > 10) {
      suggestionHistoryRef.current = suggestionHistoryRef.current.slice(-10);
    }
    
    // Update content
    const syntheticEvent = {
      target: { 
        value: newContent, 
        selectionStart: optimalCursorPosition,
        selectionEnd: optimalCursorPosition 
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onContentChange(syntheticEvent);
    
    // Set cursor position with enhanced smoothness
    requestAnimationFrame(() => {
      setCursorPosition(optimalCursorPosition, true);
      
      // Add subtle highlight effect to show where text was inserted
      if (textarea && suggestionType !== 'replacement') {
        const lineInfo = getCursorLineInfo(optimalCursorPosition);
        console.log(`AI suggestion applied at line ${lineInfo.lineNumber}, column ${lineInfo.columnNumber}`);
      }
    });
    
  }, [textareaRef, onContentChange, setCursorPosition, getCursorLineInfo]);

  const undoLastSuggestion = useCallback(() => {
    const lastSuggestion = suggestionHistoryRef.current.pop();
    if (!lastSuggestion || !textareaRef.current) return;
    
    // This would need to be implemented with proper undo/redo system
    setCursorPosition(lastSuggestion.originalPosition, true);
  }, [setCursorPosition]);

  return {
    applySuggestionWithOptimalCursor,
    undoLastSuggestion,
    suggestionHistory: suggestionHistoryRef.current
  };
};
