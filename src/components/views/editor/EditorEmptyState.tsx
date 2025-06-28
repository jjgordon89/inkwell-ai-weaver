
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useProject } from '@/contexts/ProjectContext';

const EditorEmptyState = () => {
  const { dispatch } = useProject();

  const handleCreateDocument = () => {
    const newDoc = {
      id: crypto.randomUUID(),
      title: 'New Document',
      type: 'document' as const,
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: 0,
      content: ''
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: newDoc.id });
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">No Document Selected</h2>
        <p className="text-muted-foreground mb-6">
          Select a document from the binder to start editing, or create a new one.
        </p>
        <Button onClick={handleCreateDocument}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Document
        </Button>
      </div>
    </div>
  );
};

export default EditorEmptyState;
