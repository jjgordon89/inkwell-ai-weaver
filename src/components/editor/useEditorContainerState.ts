
import { useRef, useState, useCallback, useEffect } from 'react';
import { useSmartAutoSave } from '@/hooks/useSmartAutoSave';
import { useEditorState } from '@/hooks/useEditorState';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useContextualAITriggers } from '@/hooks/useContextualAITriggers';
import { useContextualSuggestionsManager } from '@/hooks/useContextualSuggestionsManager';
import type { EditorTextareaRef } from '@/components/editor/EditorTextarea';

export const useEditorContainerState = () => {
  const textareaRef = useRef<EditorTextareaRef>(null);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  const {
    currentDocument,
    showProactivePanel,
    setShowProactivePanel,
    proactiveEnabled,
    setProactiveEnabled,
    textBeforeCursor,
    textAfterCursor,
    cursorPosition,
    setCursorPosition,
    showFloatingActions,
    setShowFloatingActions
  } = useEditorState();

  const {
    selectedText,
    selectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    setSelectedText,
    handleTextSelection
  } = useTextSelection();

  const {
    contextualSuggestions,
    handleContextualSuggestion,
    dismissContextualSuggestion,
    setContextualSuggestions
  } = useContextualSuggestionsManager();

  // Enable smart auto-save
  const { lastSave, saveHistory } = useSmartAutoSave();

  // Enhanced contextual AI triggers with intelligent assistance
  const {
    activeTriggers,
    dialogueContext,
    writingBlocks,
    userActivity,
    isTyping,
    handleTypingActivity,
    dismissTrigger
  } = useContextualAITriggers(textareaRef, handleContextualSuggestion);

  return {
    textareaRef,
    showSuggestionsPanel,
    setShowSuggestionsPanel,
    currentDocument,
    showProactivePanel,
    setShowProactivePanel,
    proactiveEnabled,
    setProactiveEnabled,
    textBeforeCursor,
    textAfterCursor,
    cursorPosition,
    setCursorPosition,
    showFloatingActions,
    setShowFloatingActions,
    selectedText,
    selectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    setSelectedText,
    handleTextSelection,
    contextualSuggestions,
    handleContextualSuggestion,
    dismissContextualSuggestion,
    setContextualSuggestions,
    lastSave,
    saveHistory,
    activeTriggers,
    dialogueContext,
    writingBlocks,
    userActivity,
    isTyping,
    handleTypingActivity,
    dismissTrigger
  };
};
