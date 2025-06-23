
import { useCallback, useEffect } from 'react';
import { useEditorContentHandler } from '@/components/editor/EditorContentHandler';
import { useEditorActionHandlers } from '@/components/editor/EditorActionHandlers';
import { useEditorActionsManager } from '@/components/editor/EditorActionsManager';

interface UseEditorEnhancedHandlersProps {
  textareaRef: any;
  handleTypingActivity: () => void;
  textAfterCursor: string;
  currentDocument: any;
  dialogueContext: any;
  setContextualSuggestions: (fn: (prev: any[]) => any[]) => void;
  setCursorPosition: (pos: any) => void;
  setShowFloatingActions: (show: boolean) => void;
  showFloatingActions: boolean;
  handleTextSelection: any;
}

export const useEditorEnhancedHandlers = ({
  textareaRef,
  handleTypingActivity,
  textAfterCursor,
  currentDocument,
  dialogueContext,
  setContextualSuggestions,
  setCursorPosition,
  setShowFloatingActions,
  showFloatingActions,
  handleTextSelection
}: UseEditorEnhancedHandlersProps) => {
  
  // Content handlers
  const {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  } = useEditorContentHandler({
    onAddToHistory: (content: string, cursorPosition: number) => {
      addToHistory(content, cursorPosition);
    },
    textareaRef
  });

  // Enhanced content change handler with typing activity tracking
  const enhancedContentChangeHandler = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleTypingActivity();
    handleContentChangeWithHistory(e);
  }, [handleTypingActivity, handleContentChangeWithHistory]);

  // Action handlers
  const {
    handleQuickAIAction,
    handleApplySuggestionFromPanel,
    suggestions
  } = useEditorActionHandlers({
    textareaRef,
    onContentChangeWithHistory: enhancedContentChangeHandler,
    onTextCompletion: handleTextCompletion,
    onShowFloatingActions: setShowFloatingActions,
    textAfterCursor
  });

  // Editor actions manager
  const {
    addToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  } = useEditorActionsManager({
    currentDocument,
    onContentChangeWithHistory: enhancedContentChangeHandler,
    textareaRef
  });

  // Create wrapper function for text selection handling
  const handleTextSelectionWrapper = useCallback(() => {
    if (textareaRef.current) {
      handleTextSelection(textareaRef.current, setCursorPosition, setShowFloatingActions);
    }
  }, [handleTextSelection, setCursorPosition, setShowFloatingActions]);

  // Enhanced contextual suggestion handler with intelligent triggers
  const handleApplyContextualSuggestion = useCallback(async (suggestion: any) => {
    if (suggestion.type === 'writing_block' && suggestion.message.includes('continue')) {
      await handleQuickAIAction('continue');
    } else if (suggestion.type === 'character_dialogue' || suggestion.type === 'smart_dialogue_character') {
      // Enhanced character-aware dialogue assistance
      const character = dialogueContext.currentCharacter;
      if (character && textareaRef.current) {
        const prompt = `Continue this dialogue in ${character}'s distinctive voice and personality`;
        handleApplyAISuggestion(prompt);
      }
    } else if (suggestion.type === 'intelligent_incomplete_thought') {
      // Help complete incomplete thoughts
      await handleQuickAIAction('continue');
    } else if (suggestion.type === 'intelligent_writing_pause') {
      // Proactive assistance during long pauses
      await handleQuickAIAction('continue');
    }
    
    // Dismiss the suggestion after applying
    setContextualSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [handleQuickAIAction, handleApplyAISuggestion, dialogueContext.currentCharacter, setContextualSuggestions]);

  // Improved floating actions auto-hide
  useEffect(() => {
    if (showFloatingActions) {
      const timer = setTimeout(() => {
        setShowFloatingActions(false);
      }, 4000); // Hide after 4 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [showFloatingActions, setShowFloatingActions]);

  // Update cursor position on scroll or resize
  useEffect(() => {
    const handleUpdate = () => {
      if (showFloatingActions && textareaRef.current) {
        // This would need to be implemented in the hook for proper cursor tracking
      }
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [showFloatingActions]);

  return {
    enhancedContentChangeHandler,
    handleApplyAISuggestion,
    handleTextCompletion,
    handleQuickAIAction,
    handleApplySuggestionFromPanel,
    suggestions,
    addToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleTextSelectionWrapper,
    handleApplyContextualSuggestion
  };
};
