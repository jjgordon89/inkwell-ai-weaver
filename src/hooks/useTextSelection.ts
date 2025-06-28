
import { useState, useCallback } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import type { EditorTextareaRef } from '@/components/editor/EditorTextarea';

interface CursorPosition {
  x: number;
  y: number;
}

export const useTextSelection = () => {
  const { dispatch } = useWriting();
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);

  const getCursorCoordinates = useCallback((textareaRef: EditorTextareaRef, position: number): CursorPosition => {
    // Get the bounding rect from the ref
    const rect = textareaRef.getBoundingClientRect();
    
    // For now, return a basic position - this could be enhanced with more precise positioning
    return {
      x: rect.left + 10, // Basic offset
      y: rect.top + 20   // Basic offset
    };
  }, []);

  const handleTextSelection = useCallback((textareaRef: EditorTextareaRef, onCursorPositionChange: (pos: CursorPosition) => void, onShowFloatingActions: (show: boolean) => void) => {
    const selection = textareaRef.value.substring(textareaRef.selectionStart, textareaRef.selectionEnd);
    const hasSelection = selection.trim().length > 0;
    
    setSelectedText(hasSelection ? selection.trim() : '');
    
    if (hasSelection) {
      const position = getCursorCoordinates(textareaRef, textareaRef.selectionStart);
      setSelectionPosition({
        x: position.x,
        y: position.y - 60
      });
      setShowInlineSuggestions(true);
      onShowFloatingActions(false);
    } else {
      setShowInlineSuggestions(false);
      
      // Show floating actions for cursor position if there's content around
      const cursorPos = textareaRef.selectionStart;
      const textBefore = textareaRef.value.slice(Math.max(0, cursorPos - 50), cursorPos);
      const textAfter = textareaRef.value.slice(cursorPos, cursorPos + 50);
      
      if (textBefore.trim() || textAfter.trim()) {
        const position = getCursorCoordinates(textareaRef, cursorPos);
        onCursorPositionChange({
          x: position.x,
          y: position.y - 40
        });
        onShowFloatingActions(true);
        
        // Auto-hide after 3 seconds
        setTimeout(() => onShowFloatingActions(false), 3000);
      }
    }
    
    // Update selected text in context
    dispatch({ type: 'SET_SELECTED_TEXT', payload: hasSelection ? selection.trim() : '' });
  }, [getCursorCoordinates, dispatch]);

  return {
    selectedText,
    selectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    setSelectedText,
    handleTextSelection
  };
};
