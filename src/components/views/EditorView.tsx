
import React, { useCallback } from 'react';
import { useEditorViewState } from './editor/useEditorViewState';
import EditorViewHeader from './editor/EditorViewHeader';
import EditorTextarea from './editor/EditorTextarea';
import EditorAIComponents from './editor/EditorAIComponents';
import EditorEmptyState from './editor/EditorEmptyState';

const EditorView = () => {
  const {
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
    <div className="h-full flex flex-col relative">
      <EditorViewHeader
        title={activeDocument.title}
        status={activeDocument.status}
        hasUnsavedChanges={hasUnsavedChanges}
        wordCount={wordCount}
        suggestionsCount={suggestions.length}
        onSave={handleSave}
      />
      
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
        suggestions={suggestions}
        onContentChange={handleContentChange}
        onApplyAISuggestion={handleApplyAISuggestion}
        onDismissInlineSuggestions={handleDismissInlineSuggestions}
      />
    </div>
  );
};

export default EditorView;
