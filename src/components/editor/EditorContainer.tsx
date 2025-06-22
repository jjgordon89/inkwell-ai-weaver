
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useEditorState } from '@/hooks/useEditorState';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useContextualAITriggers } from '@/hooks/useContextualAITriggers';
import InlineAISuggestions from '@/components/ai/InlineAISuggestions';
import AIAssistantOverlay from '@/components/ai/AIAssistantOverlay';
import ProactiveWritingSupport from '@/components/ai/ProactiveWritingSupport';
import SuggestionsPanel from '@/components/ai/SuggestionsPanel';
import ContextualSuggestions from '@/components/ai/ContextualSuggestions';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorTextarea, { EditorTextareaRef } from '@/components/editor/EditorTextarea';
import EditorFooter from '@/components/editor/EditorFooter';
import FloatingActionButtons from '@/components/editor/FloatingActionButtons';
import EditorKeyboardHandler from '@/components/editor/EditorKeyboardHandler';
import { useEditorContentHandler } from '@/components/editor/EditorContentHandler';
import { useEditorActionHandlers } from '@/components/editor/EditorActionHandlers';

interface ContextualSuggestion {
  id: string;
  type: 'writing_block' | 'character_dialogue' | 'structure' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

const EditorContainer = () => {
  const textareaRef = useRef<EditorTextareaRef>(null);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState<ContextualSuggestion[]>([]);

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

  // Handle contextual AI suggestions with improved UX
  const handleContextualSuggestion = useCallback((message: string, type: string) => {
    const suggestion: ContextualSuggestion = {
      id: `contextual-${Date.now()}-${Math.random()}`,
      type: type.includes('writing_block') ? 'writing_block' : 
            type.includes('character') ? 'character_dialogue' :
            type.includes('structure') ? 'structure' : 'general',
      message,
      priority: type.includes('pause') ? 'high' : 'medium',
      actionable: true
    };
    
    setContextualSuggestions(prev => {
      // Remove duplicates and keep only recent suggestions
      const filtered = prev.filter(s => s.message !== message && s.type !== suggestion.type);
      return [...filtered, suggestion].slice(-3); // Keep only 3 suggestions max
    });

    // Auto-dismiss low priority suggestions after 15 seconds
    if (suggestion.priority !== 'high') {
      setTimeout(() => {
        setContextualSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      }, 15000);
    }
  }, []);

  // Initialize contextual AI triggers
  const {
    writingBlocks,
    dialogueContext,
    isTyping,
    handleTypingActivity
  } = useContextualAITriggers(textareaRef, handleContextualSuggestion);

  // Content handlers
  const {
    handleContentChangeWithHistory,
    handleApplyAISuggestion,
    handleTextCompletion
  } = useEditorContentHandler({
    onAddToHistory: addToHistory,
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

  // Create wrapper function for text selection handling
  const handleTextSelectionWrapper = useCallback(() => {
    if (textareaRef.current) {
      handleTextSelection(textareaRef.current, setCursorPosition, setShowFloatingActions);
    }
  }, [handleTextSelection, setCursorPosition, setShowFloatingActions]);

  // Handle contextual suggestion actions
  const handleApplyContextualSuggestion = useCallback(async (suggestion: ContextualSuggestion) => {
    if (suggestion.type === 'writing_block' && suggestion.message.includes('continue')) {
      await handleQuickAIAction('continue');
    } else if (suggestion.type === 'character_dialogue') {
      // Focus on the current character's voice
      const character = dialogueContext.currentCharacter;
      if (character && textareaRef.current) {
        const prompt = `Continue this dialogue in ${character}'s distinctive voice and personality`;
        handleApplyAISuggestion(prompt);
      }
    }
    
    // Dismiss the suggestion after applying
    setContextualSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [handleQuickAIAction, handleApplyAISuggestion, dialogueContext.currentCharacter]);

  // Dismiss contextual suggestions
  const dismissContextualSuggestion = useCallback((id: string) => {
    setContextualSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

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
      enhancedContentChangeHandler(syntheticEvent);
      
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(previousState.cursorPosition, previousState.cursorPosition);
      }, 0);
    }
  }, [undo, enhancedContentChangeHandler]);

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
      enhancedContentChangeHandler(syntheticEvent);
      
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(nextState.cursorPosition, nextState.cursorPosition);
      }, 0);
    }
  }, [redo, enhancedContentChangeHandler]);

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
          onChange={enhancedContentChangeHandler}
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

      {/* Contextual AI Suggestions - Now less intrusive */}
      <ContextualSuggestions
        suggestions={contextualSuggestions}
        onDismiss={dismissContextualSuggestion}
        onApplyAction={handleApplyContextualSuggestion}
        isVisible={contextualSuggestions.length > 0}
        position={cursorPosition}
      />

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
