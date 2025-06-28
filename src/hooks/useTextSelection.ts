
import { useState, useCallback } from 'react';

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);

  const handleTextSelection = useCallback((
    textarea: HTMLTextAreaElement,
    setCursorPosition: (pos: { x: number; y: number }) => void,
    setShowFloatingActions: (show: boolean) => void
  ) => {
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    setSelectedText(selection);

    if (selection.length > 0) {
      // Calculate position for floating UI
      const rect = textarea.getBoundingClientRect();
      const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
      const lines = textBeforeSelection.split('\n');
      const currentLine = lines.length - 1;
      const currentColumn = lines[currentLine].length;
      
      // Rough estimation of cursor position
      const charWidth = 8;
      const lineHeight = 20;
      const x = rect.left + (currentColumn * charWidth);
      const y = rect.top + (currentLine * lineHeight);

      const position = { x, y };
      setCursorPosition(position);
      setSelectionPosition(position);
      setShowFloatingActions(true);
      setShowInlineSuggestions(true);
    } else {
      setShowFloatingActions(false);
      setShowInlineSuggestions(false);
    }
  }, []);

  return {
    selectedText,
    setSelectedText,
    selectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    handleTextSelection
  };
};
