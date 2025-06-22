
import { useCallback } from 'react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useWriting } from '@/contexts/WritingContext';

interface EditorActionHandlersProps {
  textareaRef: React.RefObject<any>;
  onContentChangeWithHistory: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextCompletion: (completion: string) => void;
  onShowFloatingActions: (show: boolean) => void;
  textAfterCursor: string;
}

export const useEditorActionHandlers = ({
  textareaRef,
  onContentChangeWithHistory,
  onTextCompletion,
  onShowFloatingActions,
  textAfterCursor
}: EditorActionHandlersProps) => {
  const { state } = useWriting();
  const { currentDocument } = state;
  const { 
    suggestions,
    improveSelectedText, 
    generateTextCompletion, 
    dismissSuggestion 
  } = useCollaborativeAI();

  const handleQuickAIAction = useCallback(async (action: 'improve' | 'continue') => {
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = textareaRef.current.value.slice(Math.max(0, cursorPos - 100), cursorPos);
    
    try {
      let result = '';
      switch (action) {
        case 'continue':
          result = await generateTextCompletion(textBefore, textAfterCursor) || '';
          if (result) onTextCompletion(' ' + result);
          break;
        case 'improve':
          if (textBefore.trim()) {
            const improvement = await improveSelectedText(textBefore.trim());
            if (improvement) {
              // Replace the text before cursor with improved version
              const newContent = textareaRef.current.value.slice(0, Math.max(0, cursorPos - 100)) + 
                                improvement.text + 
                                textareaRef.current.value.slice(cursorPos);
              
              const syntheticEvent = {
                target: { value: newContent, selectionStart: cursorPos }
              } as React.ChangeEvent<HTMLTextAreaElement>;
              onContentChangeWithHistory(syntheticEvent);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Quick AI action failed:', error);
    }
    
    onShowFloatingActions(false);
  }, [
    currentDocument, 
    generateTextCompletion, 
    textAfterCursor, 
    improveSelectedText, 
    onContentChangeWithHistory, 
    onTextCompletion, 
    onShowFloatingActions,
    textareaRef
  ]);

  const handleApplySuggestionFromPanel = useCallback((suggestion: any) => {
    // Apply the suggestion text at the current cursor position
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const currentContent = currentDocument.content || '';
    
    let newContent = '';
    if (suggestion.original) {
      // Replace original text with suggested text
      newContent = currentContent.replace(suggestion.original, suggestion.text);
    } else {
      // Insert suggestion at cursor position
      newContent = currentContent.slice(0, cursorPos) + suggestion.text + currentContent.slice(cursorPos);
    }
    
    const syntheticEvent = {
      target: { value: newContent, selectionStart: cursorPos + suggestion.text.length }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onContentChangeWithHistory(syntheticEvent);
    
    // Dismiss the suggestion after applying
    dismissSuggestion(suggestion.id);
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [currentDocument, onContentChangeWithHistory, dismissSuggestion, textareaRef]);

  return {
    handleQuickAIAction,
    handleApplySuggestionFromPanel,
    suggestions
  };
};
