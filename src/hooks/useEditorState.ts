
import { useState, useCallback } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface CursorPosition {
  x: number;
  y: number;
}

export const useEditorState = () => {
  const { state, dispatch } = useWriting();
  const { currentDocument } = state;
  const [showProactivePanel, setShowProactivePanel] = useState(false);
  const [proactiveEnabled, setProactiveEnabled] = useState(true);
  const [textBeforeCursor, setTextBeforeCursor] = useState('');
  const [textAfterCursor, setTextAfterCursor] = useState('');
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [showFloatingActions, setShowFloatingActions] = useState(false);

  const { updateContext } = useCollaborativeAI();

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentDocument) {
      const newContent = e.target.value;
      dispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: currentDocument.id,
          content: newContent
        }
      });

      // Update AI context
      updateContext({
        currentText: newContent,
        cursorPosition: e.target.selectionStart,
        selectedText: '',
        characters: state.characters.map(c => c.name)
      });

      // Update cursor context for smart completion
      const cursorPos = e.target.selectionStart;
      setTextBeforeCursor(newContent.slice(0, cursorPos));
      setTextAfterCursor(newContent.slice(cursorPos));
    }
  }, [currentDocument, dispatch, updateContext, state.characters]);

  return {
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
    handleContentChange
  };
};
