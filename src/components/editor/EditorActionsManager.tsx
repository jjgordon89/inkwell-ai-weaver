
import React, { useCallback } from 'react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import EditorKeyboardHandler from '@/components/editor/EditorKeyboardHandler';

interface EditorActionsManagerProps {
  currentDocument: any;
  onContentChangeWithHistory: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<any>;
}

export const useEditorActionsManager = ({ 
  currentDocument, 
  onContentChangeWithHistory, 
  textareaRef 
}: EditorActionsManagerProps) => {
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo(currentDocument?.content || '');

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
      onContentChangeWithHistory(syntheticEvent);
      
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(previousState.cursorPosition, previousState.cursorPosition);
      }, 0);
    }
  }, [undo, onContentChangeWithHistory]);

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
      onContentChangeWithHistory(syntheticEvent);
      
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(nextState.cursorPosition, nextState.cursorPosition);
      }, 0);
    }
  }, [redo, onContentChangeWithHistory]);

  return {
    addToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  };
};

interface EditorActionsManagerComponentProps {
  onUndo: () => void;
  onRedo: () => void;
}

const EditorActionsManager: React.FC<EditorActionsManagerComponentProps> = ({
  onUndo,
  onRedo
}) => {
  return <EditorKeyboardHandler onUndo={onUndo} onRedo={onRedo} />;
};

export default EditorActionsManager;
