
import { useCallback, useRef } from 'react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useEditorState } from '@/hooks/useEditorState';
import { useWriting } from '@/contexts/WritingContext';
import { useSmoothTextInsertion } from '@/hooks/useSmoothTextInsertion';

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

  const { insertTextSmoothly } = useSmoothTextInsertion({
    textareaRef,
    onContentChange: handleContentChangeWithHistory
  });

  const handleApplyAISuggestion = useCallback((newText: string, replaceSelection = false) => {
    insertTextSmoothly(newText, replaceSelection);
  }, [insertTextSmoothly]);

  const handleTextCompletion = useCallback((completion: string) => {
    insertTextSmoothly(completion, false);
  }, [insertTextSmoothly]);

  return {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  };
};
