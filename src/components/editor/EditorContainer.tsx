
import React from 'react';
import { useEditorContainerState } from './useEditorContainerState';
import { useEditorEnhancedHandlers } from './useEditorEnhancedHandlers';
import EditorContainerLayout from './EditorContainerLayout';

const EditorContainer = () => {
  const {
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
  } = useEditorContainerState();

  const {
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
  } = useEditorEnhancedHandlers({
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
  });

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    );
  }

  return (
    <EditorContainerLayout
      currentDocument={currentDocument}
      textareaRef={textareaRef}
      textBeforeCursor={textBeforeCursor}
      textAfterCursor={textAfterCursor}
      cursorPosition={cursorPosition}
      showFloatingActions={showFloatingActions}
      suggestions={suggestions}
      showProactivePanel={showProactivePanel}
      proactiveEnabled={proactiveEnabled}
      showSuggestionsPanel={showSuggestionsPanel}
      contextualSuggestions={contextualSuggestions}
      showInlineSuggestions={showInlineSuggestions}
      selectedText={selectedText}
      selectionPosition={selectionPosition}
      lastSave={lastSave}
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
      onDismissContextualSuggestion={dismissContextualSuggestion}
      onApplyContextualSuggestion={handleApplyContextualSuggestion}
      onCloseSuggestionsPanel={() => setShowSuggestionsPanel(false)}
      onApplySuggestionFromPanel={handleApplySuggestionFromPanel}
      onToggleProactive={() => setProactiveEnabled(!proactiveEnabled)}
      onApplyAISuggestion={handleApplyAISuggestion}
      onDismissInlineSuggestions={() => {
        setShowInlineSuggestions(false);
        setSelectedText('');
      }}
      setSelectedText={setSelectedText}
    />
  );
};

export default EditorContainer;
