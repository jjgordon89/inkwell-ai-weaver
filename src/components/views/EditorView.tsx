
import React from 'react';
import { FileText, Edit3 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from '@/contexts/ProjectContext';

const EditorView = () => {
  const { state } = useProject();
  const activeDocument = state.flatDocuments.find(doc => doc.id === state.activeDocumentId);

  if (!activeDocument) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
            <p className="text-muted-foreground">
              Select a document from the binder to start writing
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          <h2 className="font-semibold">{activeDocument.title}</h2>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <textarea
            className="w-full h-full min-h-96 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Start writing your story..."
            value={activeDocument.content || ''}
            onChange={() => {}} // TODO: Implement content updates
          />
        </div>
      </div>
    </div>
  );
};

export default EditorView;
