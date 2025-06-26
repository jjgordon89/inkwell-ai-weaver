
import React, { useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useEditorViewState } from './editor/useEditorViewState';
import EditorViewHeader from './editor/EditorViewHeader';
import EditorTextarea from './editor/EditorTextarea';
import EditorAIComponents from './editor/EditorAIComponents';
import EditorEmptyState from './editor/EditorEmptyState';
import ProjectSettings from '@/components/ProjectSettings';

const EditorView = () => {
  const { state } = useProject();
  
  // Get the active document from the project state
  const activeDocument = state.activeDocumentId 
    ? state.flatDocuments.find(doc => doc.id === state.activeDocumentId)
    : null;

  const {
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
  } = useEditorViewState();

  const handleTextSelection = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const hasSelection = selection.trim().length > 0;
    
    setSelectedText(hasSelection ? selection.trim() : '');
    
    if (hasSelection) {
      const rect = textarea.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + textarea.selectionStart * 8, // Approximate character width
        y: rect.top - 60
      });
      setShowInlineSuggestions(true);
    } else {
      setShowInlineSuggestions(false);
    }
  }, [setSelectedText, setSelectionPosition, setShowInlineSuggestions]);

  const handleApplyAISuggestion = useCallback((newText: string) => {
    if (!activeDocument) return;
    
    const currentContent = activeDocument.content || '';
    // Simple replacement for now - in real implementation, you'd track exact positions
    const newContent = currentContent.replace(selectedText, newText);
    
    handleContentChange(newContent);
    setShowInlineSuggestions(false);
    setSelectedText('');
  }, [activeDocument, selectedText, handleContentChange, setShowInlineSuggestions, setSelectedText]);

  const handleDismissInlineSuggestions = useCallback(() => {
    setShowInlineSuggestions(false);
    setSelectedText('');
  }, [setShowInlineSuggestions, setSelectedText]);

  if (!activeDocument) {
    return <EditorEmptyState />;
  }

  return (
    <div className="h-full flex flex-col">
      <EditorViewHeader
        title={activeDocument.title}
        status={activeDocument.status}
        hasUnsavedChanges={hasUnsavedChanges}
        wordCount={wordCount}
        suggestionsCount={suggestions.length}
        onSave={handleSave}
      />
      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="flex-1">
          <EditorTextarea
            content={activeDocument.content || ''}
            onChange={handleContentChange}
            onTextSelection={handleTextSelection}
          />
          <EditorAIComponents
            activeDocument={activeDocument}
            selectedText={selectedText}
            selectionPosition={selectionPosition}
            showInlineSuggestions={showInlineSuggestions}
            suggestions={suggestions.map((text, index) => ({ 
              id: `suggestion-${index}`, 
              text, 
              type: 'improvement' as const, // Changed from 'suggestion' to 'improvement' which is a valid AISuggestion type
              confidence: 0.8 
            }))} // Convert strings to proper AISuggestion objects with all required properties
            onContentChange={handleContentChange}
            onApplyAISuggestion={handleApplyAISuggestion}
            onDismissInlineSuggestions={handleDismissInlineSuggestions}
          />
        </div>
        {/* Project Settings Tab/Panel */}
        <div className="w-96 border-l bg-gray-50 p-4 overflow-y-auto hidden md:block">
          <ProjectSettings />
        </div>
      </div>
    </div>
  );
};

export default EditorView;
