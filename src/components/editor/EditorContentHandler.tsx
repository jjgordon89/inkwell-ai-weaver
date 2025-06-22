
import { useCallback, useRef } from 'react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useEditorState } from '@/hooks/useEditorState';
import { useWriting } from '@/contexts/WritingContext';
import { useAISuggestionCursor } from '@/hooks/useAISuggestionCursor';

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

  const { applySuggestionWithOptimalCursor } = useAISuggestionCursor({
    textareaRef,
    onContentChange: handleContentChangeWithHistory
  });

  const handleApplyAISuggestion = useCallback((newText: string, replaceSelection = false) => {
    const suggestionType = replaceSelection ? 'replacement' : 'completion';
    applySuggestionWithOptimalCursor(newText, suggestionType);
  }, [applySuggestionWithOptimalCursor]);

  const handleTextCompletion = useCallback((completion: string) => {
    applySuggestionWithOptimalCursor(completion, 'completion');
  }, [applySuggestionWithOptimalCursor]);

  return {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  };
};
