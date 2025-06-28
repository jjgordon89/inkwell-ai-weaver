
import { useState, useCallback } from 'react';

interface HistoryState {
  content: string;
  cursorPosition: number;
}

export const useUndoRedo = (initialContent: string = '') => {
  const [history, setHistory] = useState<HistoryState[]>([
    { content: initialContent, cursorPosition: 0 }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToHistory = useCallback((content: string, cursorPosition: number) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ content, cursorPosition });
      return newHistory.slice(-50); // Keep only last 50 states
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
