
import { useState, useCallback } from 'react';
import { useWriting } from '@/contexts/WritingContext';

interface CursorPosition {
  x: number;
  y: number;
}

export const useTextSelection = () => {
  const { dispatch } = useWriting();
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);

  const getCursorCoordinates = useCallback((textarea: HTMLTextAreaElement, position: number): CursorPosition => {
    // Create a dummy div to measure text
    const div = document.createElement('div');
    const style = window.getComputedStyle(textarea);
    
    // Copy textarea styles to div
    ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'padding', 'border'].forEach(prop => {
      div.style[prop as any] = style[prop as any];
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.width = textarea.clientWidth + 'px';
    
    document.body.appendChild(div);
    
    const textBeforePosition = textarea.value.substring(0, position);
    div.textContent = textBeforePosition;
    
    const span = document.createElement('span');
    span.textContent = '|';
    div.appendChild(span);
    
    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    return {
      x: spanRect.left - rect.left + textarea.scrollLeft,
      y: spanRect.top - rect.top + textarea.scrollTop
    };
  }, []);

  const handleTextSelection = useCallback((textarea: HTMLTextAreaElement, onCursorPositionChange: (pos: CursorPosition) => void, onShowFloatingActions: (show: boolean) => void) => {
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const hasSelection = selection.trim().length > 0;
    
    setSelectedText(hasSelection ? selection.trim() : '');
    
    if (hasSelection) {
      const position = getCursorCoordinates(textarea, textarea.selectionStart);
      setSelectionPosition({
        x: position.x + textarea.getBoundingClientRect().left,
        y: position.y + textarea.getBoundingClientRect().top - 60
      });
      setShowInlineSuggestions(true);
      onShowFloatingActions(false);
    } else {
      setShowInlineSuggestions(false);
      
      // Show floating actions for cursor position if there's content around
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.slice(Math.max(0, cursorPos - 50), cursorPos);
      const textAfter = textarea.value.slice(cursorPos, cursorPos + 50);
      
      if (textBefore.trim() || textAfter.trim()) {
        const position = getCursorCoordinates(textarea, cursorPos);
        onCursorPositionChange({
          x: position.x + textarea.getBoundingClientRect().left,
          y: position.y + textarea.getBoundingClientRect().top - 40
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
