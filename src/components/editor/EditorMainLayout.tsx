
import React from 'react';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorTextarea, { EditorTextareaRef } from '@/components/editor/EditorTextarea';
import EditorFooter from '@/components/editor/EditorFooter';
import FloatingActionButtons from '@/components/editor/FloatingActionButtons';

interface EditorMainLayoutProps {
  currentDocument: any;
  textareaRef: React.RefObject<EditorTextareaRef>;
  textBeforeCursor: string;
  textAfterCursor: string;
  cursorPosition: { x: number; y: number };
  showFloatingActions: boolean;
  suggestions: any[];
  showProactivePanel: boolean;
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
}

const EditorMainLayout: React.FC<EditorMainLayoutProps> = ({
  currentDocument,
  textareaRef,
  textBeforeCursor,
  textAfterCursor,
  cursorPosition,
  showFloatingActions,
  suggestions,
  showProactivePanel,
  onToggleProactivePanel,
  onToggleSuggestions,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onContentChange,
  onTextSelection,
  onTextCompletion,
  onQuickAIAction
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <EditorHeader
        title={currentDocument.title}
        suggestionsCount={suggestions.length}
        showProactivePanel={showProactivePanel}
        onToggleProactivePanel={onToggleProactivePanel}
        onToggleSuggestions={onToggleSuggestions}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        textareaRef={textareaRef}
      />
      
      <EditorTextarea
        ref={textareaRef}
        content={currentDocument.content || ''}
        textBeforeCursor={textBeforeCursor}
        textAfterCursor={textAfterCursor}
        onChange={onContentChange}
        onTextSelection={onTextSelection}
        onTextCompletion={onTextCompletion}
      />
      
      <FloatingActionButtons
        show={showFloatingActions}
        position={cursorPosition}
        onContinue={() => onQuickAIAction('continue')}
        onImprove={() => onQuickAIAction('improve')}
      />
      
      <EditorFooter wordCount={currentDocument.wordCount || 0} />
    </div>
  );
};

export default EditorMainLayout;
