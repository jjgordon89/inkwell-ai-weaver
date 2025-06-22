
import { useState, useCallback, useRef } from 'react';

interface HistoryState {
  content: string;
  cursorPosition: number;
}

export const useUndoRedo = (initialContent: string = '') => {
  const [history, setHistory] = useState<HistoryState[]>([
    { content: initialContent, cursorPosition: 0 }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback((content: string, cursorPosition: number) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ content, cursorPosition });
      
      // Limit history to 50 entries to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoAction.current = true;
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [canUndo, history, currentIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoAction.current = true;
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [canRedo, history, currentIndex]);

  const getCurrentState = useCallback(() => {
    return history[currentIndex];
  }, [history, currentIndex]);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState
  };
};
