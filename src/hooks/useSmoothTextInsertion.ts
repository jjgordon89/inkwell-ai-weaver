
import { useCallback, useRef } from 'react';
import { useCursorPositioning } from './useCursorPositioning';

interface SmoothTextInsertionOptions {
  textareaRef: React.RefObject<any>;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const useSmoothTextInsertion = ({ textareaRef, onContentChange }: SmoothTextInsertionOptions) => {
  const animationFrameRef = useRef<number>();
  const { calculateOptimalCursorPosition, setCursorPosition } = useCursorPositioning({ textareaRef });

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
      newCursorPosition = calculateOptimalCursorPosition(currentContent, newContent, start, text);
    } else {
      // Insert at cursor position with smart spacing
      const textBefore = currentContent.substring(Math.max(0, start - 1), start);
      const textAfter = currentContent.substring(start, start + 1);
      
      // Add spacing if needed
      let finalText = text;
      const needsSpaceBefore = textBefore && !textBefore.match(/\s$/) && 
                               !text.startsWith(' ') && textBefore.match(/\w$/);
      const needsSpaceAfter = textAfter && !textAfter.match(/^\s/) && 
                              !text.endsWith(' ') && textAfter.match(/^\w/);
      
      if (needsSpaceBefore) {
        finalText = ' ' + text;
      }
      if (needsSpaceAfter) {
        finalText = finalText + ' ';
      }
      
      newContent = currentContent.substring(0, start) + finalText + currentContent.substring(start);
      newCursorPosition = calculateOptimalCursorPosition(currentContent, newContent, start, finalText);
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
    
    // Smooth cursor positioning with enhanced animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      // Set cursor position with smooth animation
      setCursorPosition(newCursorPosition, true);
      
      // Add subtle visual feedback
      if (textarea) {
        textarea.style.transition = 'box-shadow 0.2s ease';
        textarea.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)';
        
        setTimeout(() => {
          textarea.style.boxShadow = '';
          textarea.style.transition = '';
        }, 200);
      }
    });
  }, [textareaRef, onContentChange, calculateOptimalCursorPosition, setCursorPosition]);

  return { insertTextSmoothly };
};
