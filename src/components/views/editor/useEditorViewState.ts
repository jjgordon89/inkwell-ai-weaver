
import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';

export const useEditorViewState = () => {
  const { state, dispatch } = useProject();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [suggestions] = useState<string[]>([]); // Placeholder for AI suggestions

  const activeDocument = state.activeDocumentId 
    ? state.flatDocuments.find(doc => doc.id === state.activeDocumentId)
    : null;

  const wordCount = activeDocument?.content 
    ? activeDocument.content.trim().split(/\s+/).filter(Boolean).length 
    : 0;

  const handleContentChange = useCallback((newContent: string) => {
    if (!activeDocument) return;
    
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: {
          content: newContent,
          wordCount: newContent.trim().split(/\s+/).filter(Boolean).length
        }
      }
    });
    
    setHasUnsavedChanges(true);
  }, [activeDocument, dispatch]);

  const handleSave = useCallback(() => {
    // In a real app, this would save to database
    setHasUnsavedChanges(false);
    console.log('Document saved:', activeDocument?.title);
  }, [activeDocument]);

  // Reset unsaved changes when document changes
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [state.activeDocumentId]);

  return {
    activeDocument,
    hasUnsavedChanges,
    wordCount,
    selectedText,
    setSelectedText,
    selectionPosition,
    setSelectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    suggestions,
    handleContentChange,
    handleSave
  };
};
