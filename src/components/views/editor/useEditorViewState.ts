
import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from "@/hooks/use-toast";
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

export const useEditorViewState = () => {
  const { state, dispatch } = useProject();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  
  const activeDocument = state.flatDocuments.find(doc => doc.id === state.activeDocumentId);
  const { suggestions, updateContext } = useCollaborativeAI();

  const handleContentChange = useCallback((newContent: string) => {
    if (!activeDocument) return;

    // Calculate word count
    const words = newContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Update document content
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: {
          content: newContent,
          wordCount: words.length,
          lastModified: new Date()
        }
      }
    });
    
    // Update AI context
    updateContext({
      currentText: newContent,
      cursorPosition: 0,
      selectedText: '',
      characters: []
    });
    
    setHasUnsavedChanges(true);
  }, [activeDocument, dispatch, updateContext]);

  const handleSave = useCallback(() => {
    if (!activeDocument) return;
    
    setHasUnsavedChanges(false);
    toast({
      title: "Document saved",
      description: `"${activeDocument.title}" has been saved successfully.`,
    });
  }, [activeDocument, toast]);

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
