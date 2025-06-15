import React from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useAutoSave } from '@/hooks/useAutoSave';

const Editor = () => {
  const { state, dispatch } = useWriting();
  const { currentDocument } = state;

  // Enable auto-save
  useAutoSave();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentDocument) {
      dispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: currentDocument.id,
          content: e.target.value
        }
      });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    if (selectedText.trim()) {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: selectedText.trim() });
    }
  };

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">{currentDocument.title}</h2>
        <div className="text-xs text-muted-foreground">
          Auto-save enabled
        </div>
      </div>
      <div className="flex-grow p-8 md:p-12 lg:p-16">
        <textarea
          value={currentDocument.content}
          onChange={handleContentChange}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          className="w-full max-w-3xl mx-auto h-full resize-none bg-transparent focus:outline-none font-serif text-lg leading-relaxed text-foreground"
          placeholder="Start writing your story..."
        />
      </div>
      <div className="p-4 border-t text-right text-sm text-muted-foreground">
        {currentDocument.wordCount} Words
      </div>
    </div>
  );
};

export default Editor;
