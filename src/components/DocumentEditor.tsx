
import React from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const DocumentEditor = () => {
  const { state, dispatch } = useWriting();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.currentDocument) return;
    
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: state.currentDocument.id,
        updates: { title: e.target.value }
      }
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!state.currentDocument) return;
    
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: state.currentDocument.id,
        content: e.target.value
      }
    });
  };

  if (!state.currentDocument) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a document to start editing
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Input
        value={state.currentDocument.title}
        onChange={handleTitleChange}
        className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
        placeholder="Document title..."
      />
      <Textarea
        value={state.currentDocument.content || ''}
        onChange={handleContentChange}
        placeholder="Start writing..."
        className="flex-1 min-h-0 resize-none border-none px-0 focus-visible:ring-0"
      />
    </div>
  );
};

export default DocumentEditor;
