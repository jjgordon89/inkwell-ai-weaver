import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useEditorState } from '@/hooks/useEditorState';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useContextualAITriggers } from '@/hooks/useContextualAITriggers';
import { useEditorContentHandler } from '@/components/editor/EditorContentHandler';
import { useEditorActionHandlers } from '@/components/editor/EditorActionHandlers';
import { useContextualSuggestionsManager } from '@/hooks/useContextualSuggestionsManager';
import { useEditorActionsManager } from '@/components/editor/EditorActionsManager';
import EditorActionsManager from '@/components/editor/EditorActionsManager';
import EditorMainLayout from '@/components/editor/EditorMainLayout';
import EditorAIPanels from '@/components/editor/EditorAIPanels';
import type { EditorTextareaRef } from '@/components/editor/EditorTextarea';

const EditorContainer = () => {
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

  // Enable auto-save
  useAutoSave();

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

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background relative">
      <EditorActionsManager onUndo={handleUndo} onRedo={handleRedo} />
      
      {/* Main Editor Area */}
      <EditorMainLayout
        currentDocument={currentDocument}
        textareaRef={textareaRef}
        textBeforeCursor={textBeforeCursor}
        textAfterCursor={textAfterCursor}
        cursorPosition={cursorPosition}
        showFloatingActions={showFloatingActions}
        suggestions={suggestions}
        showProactivePanel={showProactivePanel}
        onToggleProactivePanel={() => setShowProactivePanel(!showProactivePanel)}
        onToggleSuggestions={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onContentChange={enhancedContentChangeHandler}
        onTextSelection={handleTextSelectionWrapper}
        onTextCompletion={handleTextCompletion}
        onQuickAIAction={handleQuickAIAction}
      />

      {/* Enhanced AI Panels with intelligent contextual awareness */}
      <EditorAIPanels
        contextualSuggestions={contextualSuggestions}
        cursorPosition={cursorPosition}
        onDismissContextualSuggestion={dismissContextualSuggestion}
        onApplyContextualSuggestion={handleApplyContextualSuggestion}
        suggestions={suggestions}
        showSuggestionsPanel={showSuggestionsPanel}
        onCloseSuggestionsPanel={() => setShowSuggestionsPanel(false)}
        onApplySuggestionFromPanel={handleApplySuggestionFromPanel}
        showProactivePanel={showProactivePanel}
        proactiveEnabled={proactiveEnabled}
        onToggleProactive={() => setProactiveEnabled(!proactiveEnabled)}
        showInlineSuggestions={showInlineSuggestions}
        selectedText={selectedText}
        selectionPosition={selectionPosition}
        currentDocument={currentDocument}
        onApplyAISuggestion={handleApplyAISuggestion}
        onDismissInlineSuggestions={() => {
          setShowInlineSuggestions(false);
          setSelectedText('');
        }}
        setSelectedText={setSelectedText}
      />
    </div>
  );
};

export default EditorContainer;
