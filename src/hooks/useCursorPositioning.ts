
import { useCallback, useRef } from 'react';

interface CursorPositioningOptions {
  textareaRef: React.RefObject<any>;
}

export const useCursorPositioning = ({ textareaRef }: CursorPositioningOptions) => {
  const lastPositionRef = useRef<number>(0);

  const calculateOptimalCursorPosition = useCallback((
    originalText: string,
    newText: string,
    insertionPoint: number,
    insertedText: string
  ): number => {
    // Calculate where the cursor should be positioned after insertion
    const basePosition = insertionPoint + insertedText.length;
    
    // Check if we need to adjust for spacing
    const textAfterInsertion = newText.substring(basePosition, basePosition + 1);
    const textBeforeInsertion = newText.substring(basePosition - 1, basePosition);
    
    // If we're at the end of a word and there's no space, position after the word
    if (textAfterInsertion && textAfterInsertion.match(/^\w/) && 
        textBeforeInsertion && textBeforeInsertion.match(/\w$/)) {
      return basePosition + 1;
    }
    
    return basePosition;
  }, []);

  const smoothScrollToCursor = useCallback((cursorPosition: number) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    
    // Calculate optimal scroll position
    const viewportHeight = textarea.clientHeight;
    const linesInView = Math.floor(viewportHeight / lineHeight);
    const targetLine = Math.max(0, currentLine - Math.floor(linesInView / 2));
    const targetScrollTop = targetLine * lineHeight;
    
    // Only scroll if significantly different from current position
    const scrollDifference = Math.abs(textarea.scrollTop - targetScrollTop);
    if (scrollDifference > lineHeight * 2) {
      textarea.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [textareaRef]);

  const setCursorPosition = useCallback((
    position: number,
    withAnimation = true
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    lastPositionRef.current = position;

    if (withAnimation) {
      // Use requestAnimationFrame for smooth positioning
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(position, position);
        smoothScrollToCursor(position);
      });
    } else {
      textarea.focus();
      textarea.setSelectionRange(position, position);
    }
  }, [textareaRef, smoothScrollToCursor]);

  const getCursorLineInfo = useCallback((position?: number): {
    lineNumber: number;
    columnNumber: number;
    isEndOfLine: boolean;
  } => {
    if (!textareaRef.current) return { lineNumber: 0, columnNumber: 0, isEndOfLine: false };

    const textarea = textareaRef.current;
    const cursorPos = position ?? textarea.selectionStart ?? 0;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    
    return {
      lineNumber: lines.length,
      columnNumber: lines[lines.length - 1].length,
      isEndOfLine: cursorPos === textarea.value.length || 
                   textarea.value[cursorPos] === '\n'
    };
  }, [textareaRef]);

  const preserveCursorContext = useCallback((callback: () => void) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforePosition = textarea.selectionStart;
    const lineInfo = getCursorLineInfo(beforePosition);
    
    callback();
    
    // Restore cursor context after callback
    requestAnimationFrame(() => {
      if (textarea && beforePosition !== undefined) {
        setCursorPosition(beforePosition, true);
      }
    });
  }, [textareaRef, getCursorLineInfo, setCursorPosition]);

  return {
    calculateOptimalCursorPosition,
    setCursorPosition,
    smoothScrollToCursor,
    getCursorLineInfo,
    preserveCursorContext,
    lastPosition: lastPositionRef.current
  };
};
