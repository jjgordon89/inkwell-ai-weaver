
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DocumentEditor = () => {
  const { state: projectState, dispatch: projectDispatch } = useProject();
  const { state: writingState, dispatch: writingDispatch } = useWriting();

  const activeDocument = projectState.flatDocuments.find(
    doc => doc.id === projectState.activeDocumentId
  );

  if (!activeDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    );
  }

  const handleTitleChange = (newTitle: string) => {
    projectDispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: { title: newTitle }
      }
    });
  };

  const handleContentChange = (newContent: string) => {
    projectDispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: { content: newContent }
      }
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="space-y-2">
        <Label htmlFor="document-title">Document Title</Label>
        <Input
          id="document-title"
          value={activeDocument.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-lg font-semibold"
        />
      </div>
      
      <div className="flex-1 space-y-2">
        <Label htmlFor="document-content">Content</Label>
        <Textarea
          id="document-content"
          value={activeDocument.content || ''}
          onChange={(e) => handleContentChange(e.target.value)}
          className="h-full resize-none"
          placeholder="Start writing your story..."
        />
      </div>
    </div>
  );
};

export default DocumentEditor;
