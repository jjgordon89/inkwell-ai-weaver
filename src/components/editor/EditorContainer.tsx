
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useEditorState } from '@/hooks/useEditorState';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import InlineAISuggestions from '@/components/ai/InlineAISuggestions';
import AIAssistantOverlay from '@/components/ai/AIAssistantOverlay';
import ProactiveWritingSupport from '@/components/ai/ProactiveWritingSupport';
import SuggestionsPanel from '@/components/ai/SuggestionsPanel';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorTextarea, { EditorTextareaRef } from '@/components/editor/EditorTextarea';
import EditorFooter from '@/components/editor/EditorFooter';
import FloatingActionButtons from '@/components/editor/FloatingActionButtons';
import EditorKeyboardHandler from '@/components/editor/EditorKeyboardHandler';
import { useEditorContentHandler } from '@/components/editor/EditorContentHandler';
import { useEditorActionHandlers } from '@/components/editor/EditorActionHandlers';

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
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo(currentDocument?.content || '');

  const {
    selectedText,
    selectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    setSelectedText,
    handleTextSelection
  } = useTextSelection();

  // Enable auto-save
  useAutoSave();

  // Content handlers
  const {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  } = useEditorContentHandler({
    onAddToHistory: addToHistory,
    textareaRef
  });

  // Action handlers
  const {
    handleQuickAIAction,
    handleApplySuggestionFromPanel,
    suggestions
  } = useEditorActionHandlers({
    textareaRef,
    onContentChangeWithHistory: handleContentChangeWithHistory,
    onTextCompletion: handleTextCompletion,
    onShowFloatingActions: setShowFloatingActions,
    textAfterCursor
  });

  // Handle undo action
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState && textareaRef.current) {
      const syntheticEvent = {
        target: { 
          value: previousState.content, 
          selectionStart: previousState.cursorPosition 
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      handleContentChangeWithHistory(syntheticEvent);
      
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(previousState.cursorPosition, previousState.cursorPosition);
      }, 0);
    }
  }, [undo, handleContentChangeWithHistory]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState && textareaRef.current) {
      const syntheticEvent = {
        target: { 
          value: nextState.content, 
          selectionStart: nextState.cursorPosition 
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      handleContentChangeWithHistory(syntheticEvent);
      
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(nextState.cursorPosition, nextState.cursorPosition);
      }, 0);
    }
  }, [redo, handleContentChangeWithHistory]);

  const handleTextSelectionWrapper = useCallback(() => {
    if (!textareaRef.current) return;
    const textarea = {
      value: textareaRef.current.value,
      selectionStart: textareaRef.current.selectionStart,
      selectionEnd: textareaRef.current.selectionEnd,
      getBoundingClientRect: () => textareaRef.current!.getBoundingClientRect()
    } as HTMLTextAreaElement;
    
    handleTextSelection(textarea, setCursorPosition, setShowFloatingActions);
  }, [handleTextSelection, setCursorPosition, setShowFloatingActions]);

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
      <EditorKeyboardHandler onUndo={handleUndo} onRedo={handleRedo} />
      
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <EditorHeader
          title={currentDocument.title}
          suggestionsCount={suggestions.length}
          showProactivePanel={showProactivePanel}
          onToggleProactivePanel={() => setShowProactivePanel(!showProactivePanel)}
          onToggleSuggestions={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        
        <EditorTextarea
          ref={textareaRef}
          content={currentDocument.content || ''}
          textBeforeCursor={textBeforeCursor}
          textAfterCursor={textAfterCursor}
          onChange={handleContentChangeWithHistory}
          onTextSelection={handleTextSelectionWrapper}
          onTextCompletion={handleTextCompletion}
        />
        
        <FloatingActionButtons
          show={showFloatingActions}
          position={cursorPosition}
          onContinue={() => handleQuickAIAction('continue')}
          onImprove={() => handleQuickAIAction('improve')}
        />
        
        <EditorFooter wordCount={currentDocument.wordCount || 0} />
      </div>

      {/* AI Suggestions Panel */}
      <SuggestionsPanel
        suggestions={suggestions}
        isVisible={showSuggestionsPanel}
        onClose={() => setShowSuggestionsPanel(false)}
        onApplySuggestion={handleApplySuggestionFromPanel}
        onDismissSuggestion={(id) => suggestions.find(s => s.id === id) && handleApplySuggestionFromPanel(suggestions.find(s => s.id === id)!)}
      />

      {/* Proactive Writing Support Panel */}
      {showProactivePanel && (
        <div className="w-80 border-l bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <ProactiveWritingSupport
              isEnabled={proactiveEnabled}
              onToggle={() => setProactiveEnabled(!proactiveEnabled)}
            />
          </div>
        </div>
      )}
      
      {/* Inline AI Suggestions for Selected Text */}
      {showInlineSuggestions && selectedText && (
        <InlineAISuggestions
          selectedText={selectedText}
          onApply={handleApplyAISuggestion}
          onDismiss={() => {
            setShowInlineSuggestions(false);
            setSelectedText('');
          }}
          position={selectionPosition}
          documentContent={currentDocument.content || ''}
        />
      )}
      
      {/* AI Assistant Overlay */}
      <AIAssistantOverlay />
    </div>
  );
};

export default EditorContainer;
