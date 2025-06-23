
import React from 'react';
import EditorActionsManager from '@/components/editor/EditorActionsManager';
import EditorMainLayout from '@/components/editor/EditorMainLayout';
import EditorAIPanels from '@/components/editor/EditorAIPanels';
import type { EditorTextareaRef } from '@/components/editor/EditorTextarea';

interface EditorContainerLayoutProps {
  currentDocument: any;
  textareaRef: React.RefObject<EditorTextareaRef>;
  textBeforeCursor: string;
  textAfterCursor: string;
  cursorPosition: { x: number; y: number };
  showFloatingActions: boolean;
  suggestions: any[];
  showProactivePanel: boolean;
  proactiveEnabled: boolean;
  showSuggestionsPanel: boolean;
  contextualSuggestions: any[];
  showInlineSuggestions: boolean;
  selectedText: string;
  selectionPosition: { x: number; y: number };
  lastSave: any;
  
  // Handlers
  onToggleProactivePanel: () => void;
  onToggleSuggestions: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextSelection: () => void;
  onTextCompletion: (completion: string) => void;
  onQuickAIAction: (action: 'continue' | 'improve') => void;
  onDismissContextualSuggestion: (id: string) => void;
  onApplyContextualSuggestion: (suggestion: any) => void;
  onCloseSuggestionsPanel: () => void;
  onApplySuggestionFromPanel: (suggestion: any) => void;
  onToggleProactive: () => void;
  onApplyAISuggestion: (text: string) => void;
  onDismissInlineSuggestions: () => void;
  setSelectedText: (text: string) => void;
}

const EditorContainerLayout: React.FC<EditorContainerLayoutProps> = ({
  currentDocument,
  textareaRef,
  textBeforeCursor,
  textAfterCursor,
  cursorPosition,
  showFloatingActions,
  suggestions,
  showProactivePanel,
  proactiveEnabled,
  showSuggestionsPanel,
  contextualSuggestions,
  showInlineSuggestions,
  selectedText,
  selectionPosition,
  lastSave,
  onToggleProactivePanel,
  onToggleSuggestions,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onContentChange,
  onTextSelection,
  onTextCompletion,
  onQuickAIAction,
  onDismissContextualSuggestion,
  onApplyContextualSuggestion,
  onCloseSuggestionsPanel,
  onApplySuggestionFromPanel,
  onToggleProactive,
  onApplyAISuggestion,
  onDismissInlineSuggestions,
  setSelectedText
}) => {
  return (
    <div className="h-full w-full flex bg-background relative overflow-hidden">
      <EditorActionsManager onUndo={onUndo} onRedo={onRedo} />
      
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
        onToggleProactivePanel={onToggleProactivePanel}
        onToggleSuggestions={onToggleSuggestions}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onContentChange={onContentChange}
        onTextSelection={onTextSelection}
        onTextCompletion={onTextCompletion}
        onQuickAIAction={onQuickAIAction}
      />

      {/* Enhanced AI Panels with intelligent contextual awareness */}
      <EditorAIPanels
        contextualSuggestions={contextualSuggestions}
        cursorPosition={cursorPosition}
        onDismissContextualSuggestion={onDismissContextualSuggestion}
        onApplyContextualSuggestion={onApplyContextualSuggestion}
        suggestions={suggestions}
        showSuggestionsPanel={showSuggestionsPanel}
        onCloseSuggestionsPanel={onCloseSuggestionsPanel}
        onApplySuggestionFromPanel={onApplySuggestionFromPanel}
        showProactivePanel={showProactivePanel}
        proactiveEnabled={proactiveEnabled}
        onToggleProactive={onToggleProactive}
        showInlineSuggestions={showInlineSuggestions}
        selectedText={selectedText}
        selectionPosition={selectionPosition}
        currentDocument={currentDocument}
        onApplyAISuggestion={onApplyAISuggestion}
        onDismissInlineSuggestions={onDismissInlineSuggestions}
        setSelectedText={setSelectedText}
      />

      {/* Smart Save Status - show recent save insights */}
      {lastSave && (
        <div className="fixed bottom-4 right-4 z-30 max-w-xs">
          <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2 text-xs text-muted-foreground">
            Last save: {lastSave.wordCount} words
            {lastSave.keyChanges.length > 0 && (
              <span className="ml-2 text-primary block truncate">• {lastSave.keyChanges[0]}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorContainerLayout;
