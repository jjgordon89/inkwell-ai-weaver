
import { useCallback, useRef } from 'react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useEditorState } from '@/hooks/useEditorState';
import { useWriting } from '@/contexts/WritingContext';

interface EditorContentHandlerProps {
  onAddToHistory: (content: string, cursorPosition: number) => void;
  textareaRef: React.RefObject<any>;
}

export const useEditorContentHandler = ({ onAddToHistory, textareaRef }: EditorContentHandlerProps) => {
  const { state } = useWriting();
  const { currentDocument } = state;
  const { handleContentChange } = useEditorState();
  const { updateContext } = useCollaborativeAI();
  const pendingCursorPosition = useRef<number | null>(null);

  const smoothCursorTransition = useCallback((targetPosition: number) => {
    if (!textareaRef.current) return;
    
    // Store the target position
    pendingCursorPosition.current = targetPosition;
    
    // Use requestAnimationFrame for smooth cursor positioning
    requestAnimationFrame(() => {
      if (textareaRef.current && pendingCursorPosition.current !== null) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pendingCursorPosition.current, pendingCursorPosition.current);
        
        // Smooth scroll to cursor position if needed
        const textarea = textareaRef.current;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
        const cursorLine = textarea.value.substring(0, pendingCursorPosition.current).split('\n').length;
        const scrollTop = Math.max(0, (cursorLine - 5) * lineHeight);
        
        if (Math.abs(textarea.scrollTop - scrollTop) > lineHeight * 3) {
          textarea.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
        
        pendingCursorPosition.current = null;
      }
    });
  }, [textareaRef]);

  const handleContentChangeWithHistory = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.target.selectionStart || 0;
    
    // Add current state to history before making changes
    if (currentDocument?.content !== e.target.value) {
      onAddToHistory(e.target.value, cursorPos);
    }
    
    // Call the original handler
    handleContentChange(e);
  }, [handleContentChange, onAddToHistory, currentDocument]);

  const handleApplyAISuggestion = useCallback((newText: string, replaceSelection = false) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentContent = currentDocument.content || '';
    
    let newContent = '';
    let newCursorPosition = 0;
    
    if (replaceSelection && start !== end) {
      // Replace selected text
      newContent = currentContent.substring(0, start) + newText + currentContent.substring(end);
      newCursorPosition = start + newText.length;
    } else {
      // Insert at cursor position
      newContent = currentContent.substring(0, start) + newText + currentContent.substring(start);
      newCursorPosition = start + newText.length;
    }
    
    // Update content with smooth transition
    const syntheticEvent = {
      target: { value: newContent, selectionStart: newCursorPosition }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChangeWithHistory(syntheticEvent);
    
    // Apply smooth cursor positioning
    setTimeout(() => smoothCursorTransition(newCursorPosition), 50);
  }, [currentDocument, handleContentChangeWithHistory, textareaRef, smoothCursorTransition]);

  const handleTextCompletion = useCallback((completion: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const currentContent = currentDocument.content || '';
    
    // Smart completion - add space if needed
    const textBefore = currentContent.slice(Math.max(0, cursorPos - 1), cursorPos);
    const needsSpace = textBefore && !textBefore.match(/\s$/) && !completion.startsWith(' ');
    const finalCompletion = needsSpace ? ' ' + completion : completion;
    
    const newContent = currentContent.slice(0, cursorPos) + finalCompletion + currentContent.slice(cursorPos);
    const newCursorPosition = cursorPos + finalCompletion.length;
    
    const syntheticEvent = {
      target: { value: newContent, selectionStart: newCursorPosition }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChangeWithHistory(syntheticEvent);
    
    // Smooth cursor positioning with slight delay for natural feel
    setTimeout(() => smoothCursorTransition(newCursorPosition), 100);
  }, [currentDocument, handleContentChangeWithHistory, textareaRef, smoothCursorTransition]);

  return {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  };
};
