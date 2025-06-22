
import React from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from '@/contexts/ProjectContext';

const ResearchView = () => {
  const { state, dispatch } = useProject();
  
  // Get all research notes
  const researchNotes = state.flatDocuments.filter(doc => 
    doc.type === 'research-note'
  );

  const handleAddNote = () => {
    // Find the Research folder
    const researchFolder = state.flatDocuments.find(doc => 
      doc.title === 'Research' && doc.type === 'folder'
    );
    
    // If no Research folder exists, create the note at root level
    const parentId = researchFolder?.id || undefined;
    
    const newNote = {
      id: crypto.randomUUID(),
      title: 'New Research Note',
      type: 'research-note' as const,
      parentId,
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: researchNotes.length,
      content: '',
      synopsis: 'New research note...'
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newNote });
  };

  const handleNoteSelect = (docId: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: docId });
    dispatch({ 
      type: 'SET_ACTIVE_VIEW', 
      payload: { id: 'editor', name: 'Editor', type: 'editor' } 
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <h2 className="font-semibold">Research</h2>
          </div>
          <Button size="sm" onClick={handleAddNote}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        {researchNotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Research Notes</h3>
              <p className="text-muted-foreground mb-4">
                Create your first research note to organize your references and materials.
              </p>
              <Button onClick={handleAddNote}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchNotes.map((note) => (
              <Card
                key={note.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleNoteSelect(note.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                        {note.title}
                      </h3>
                    </div>
                  </div>
                  
                  {note.synopsis && (
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                      {note.synopsis}
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {note.wordCount?.toLocaleString() || 0} words
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchView;
