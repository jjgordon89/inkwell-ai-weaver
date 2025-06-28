
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useEditorViewState } from './editor/useEditorViewState';
import EditorViewHeader from './editor/EditorViewHeader';
import EditorTextarea from './editor/EditorTextarea';
import EditorEmptyState from './editor/EditorEmptyState';
import EditorAIComponents from './editor/EditorAIComponents';

const EditorView = () => {
  const {
    activeDocument,
    hasUnsavedChanges,
    wordCount,
    selectedText,
    selectionPosition,
    showInlineSuggestions,
    suggestions,
    handleContentChange,
    handleSave,
    setSelectedText,
    setSelectionPosition,
    setShowInlineSuggestions
  } = useEditorViewState();

  if (!activeDocument) {
    return <EditorEmptyState />;
  }

  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    if (selection.length > 0) {
      setSelectedText(selection);
      
      // Calculate position for inline suggestions
      const rect = textarea.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + 20,
        y: rect.top - 60
      });
      setShowInlineSuggestions(true);
    } else {
      setShowInlineSuggestions(false);
    }
  };

  const handleApplyAISuggestion = (text: string) => {
    if (selectedText && activeDocument.content) {
      const newContent = activeDocument.content.replace(selectedText, text);
      handleContentChange(newContent);
    }
    setShowInlineSuggestions(false);
  };

  const handleDismissInlineSuggestions = () => {
    setShowInlineSuggestions(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <EditorViewHeader
        title={activeDocument.title}
        status={activeDocument.status}
        hasUnsavedChanges={hasUnsavedChanges}
        wordCount={wordCount}
        suggestionsCount={suggestions.length}
        onSave={handleSave}
      />
      
      <div className="flex-1 relative">
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
          suggestions={suggestions.map(s => ({
            id: s,
            text: `AI suggestion for: "${selectedText}"`,
            type: 'improvement' as const,
            confidence: 0.8
          }))}
          onContentChange={handleContentChange}
          onApplyAISuggestion={handleApplyAISuggestion}
          onDismissInlineSuggestions={handleDismissInlineSuggestions}
        />
      </div>
    </div>
  );
};

export default EditorView;
