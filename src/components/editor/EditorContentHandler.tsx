
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

  const handleContentChangeWithHistory = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.target.selectionStart || 0;
    
    // Add current state to history before making changes
    if (currentDocument?.content !== e.target.value) {
      onAddToHistory(e.target.value, cursorPos);
    }
    
    // Call the original handler
    handleContentChange(e);
  }, [handleContentChange, onAddToHistory, currentDocument]);

  const handleApplyAISuggestion = useCallback((newText: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentContent = currentDocument.content || '';
    
    const newContent = currentContent.substring(0, start) + newText + currentContent.substring(end);
    
    // Update content directly using the change handler
    const syntheticEvent = {
      target: { value: newContent, selectionStart: start + newText.length }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChangeWithHistory(syntheticEvent);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  }, [currentDocument, handleContentChangeWithHistory, textareaRef]);

  const handleTextCompletion = useCallback((completion: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const currentContent = currentDocument.content || '';
    
    const newContent = currentContent.slice(0, cursorPos) + completion + currentContent.slice(cursorPos);
    
    const syntheticEvent = {
      target: { value: newContent, selectionStart: cursorPos + completion.length }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChangeWithHistory(syntheticEvent);
    
    // Set cursor after the completion
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursorPos + completion.length, cursorPos + completion.length);
    }, 0);
  }, [currentDocument, handleContentChangeWithHistory, textareaRef]);

  return {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  };
};
