
import { useState, useCallback, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';

export const useEditorState = () => {
  const { state, dispatch } = useProject();
  const [showProactivePanel, setShowProactivePanel] = useState(false);
  const [proactiveEnabled, setProactiveEnabled] = useState(true);
  const [textBeforeCursor, setTextBeforeCursor] = useState('');
  const [textAfterCursor, setTextAfterCursor] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showFloatingActions, setShowFloatingActions] = useState(false);

  const currentDocument = state.activeDocumentId 
    ? state.flatDocuments.find(doc => doc.id === state.activeDocumentId)
    : null;

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentDocument) return;

    const content = e.target.value;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: currentDocument.id,
        updates: {
          content,
          wordCount
        }
      }
    });
  }, [currentDocument, dispatch]);

  // Update cursor context when content changes
  useEffect(() => {
    if (currentDocument?.content) {
      const content = currentDocument.content;
      const cursorPos = content.length; // Default to end
      setTextBeforeCursor(content.slice(Math.max(0, cursorPos - 100), cursorPos));
      setTextAfterCursor(content.slice(cursorPos, cursorPos + 100));
    }
  }, [currentDocument?.content]);

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
