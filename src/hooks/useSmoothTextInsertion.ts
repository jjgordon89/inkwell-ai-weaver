
import { useCallback, useRef } from 'react';

interface SmoothTextInsertionOptions {
  textareaRef: React.RefObject<any>;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const useSmoothTextInsertion = ({ textareaRef, onContentChange }: SmoothTextInsertionOptions) => {
  const animationFrameRef = useRef<number>();

  const insertTextSmoothly = useCallback((text: string, replaceSelection = false) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = textarea.value;
    
    let newContent = '';
    let newCursorPosition = 0;
    
    if (replaceSelection && start !== end) {
      // Replace selected text
      newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
      newCursorPosition = start + text.length;
    } else {
      // Insert at cursor position with smart spacing
      const textBefore = currentContent.substring(Math.max(0, start - 1), start);
      const textAfter = currentContent.substring(start, start + 1);
      
      // Add spacing if needed
      let finalText = text;
      if (textBefore && !textBefore.match(/\s$/) && !text.startsWith(' ') && textBefore.match(/\w$/)) {
        finalText = ' ' + text;
      }
      if (textAfter && !textAfter.match(/^\s/) && !text.endsWith(' ') && textAfter.match(/^\w/)) {
        finalText = finalText + ' ';
      }
      
      newContent = currentContent.substring(0, start) + finalText + currentContent.substring(start);
      newCursorPosition = start + finalText.length;
    }
    
    // Create synthetic event for content change
    const syntheticEvent = {
      target: { 
        value: newContent, 
        selectionStart: newCursorPosition,
        selectionEnd: newCursorPosition 
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    // Update content
    onContentChange(syntheticEvent);
    
    // Smooth cursor positioning with animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Smooth scroll to cursor if needed
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
        const cursorLine = newContent.substring(0, newCursorPosition).split('\n').length;
        const targetScrollTop = Math.max(0, (cursorLine - 8) * lineHeight);
        
        // Only scroll if significantly different
        if (Math.abs(textarea.scrollTop - targetScrollTop) > lineHeight * 3) {
          textarea.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    });
  }, [textareaRef, onContentChange]);

  return { insertTextSmoothly };
};
