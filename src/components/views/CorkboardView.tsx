import React from 'react';
import { Grid3X3, Plus, Edit3, FileText, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProject } from '@/contexts/ProjectContext';

const CorkboardView = () => {
  const { state, dispatch } = useProject();
  
  // Get all documents that are chapters or scenes
  const corkboardItems = state.flatDocuments.filter(doc => 
    doc.type === 'chapter' || doc.type === 'scene'
  );

  const handleAddScene = () => {
    // Find the Manuscript folder
    const manuscriptFolder = state.flatDocuments.find(doc => 
      doc.title === 'Manuscript' && doc.type === 'folder'
    );
    
    const newChapter = {
      id: crypto.randomUUID(),
      title: 'New Chapter',
      type: 'chapter' as const,
      parentId: manuscriptFolder?.id, // Set parent to Manuscript folder
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: corkboardItems.length,
      synopsis: 'Brief chapter description...'
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newChapter });
  };

  const handleDocumentSelect = (docId: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: docId });
    dispatch({ 
      type: 'SET_ACTIVE_VIEW', 
      payload: { id: 'editor', name: 'Editor', type: 'editor' } 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-50 border-green-200';
      case 'revised': return 'bg-blue-50 border-blue-200';
      case 'first-draft': return 'bg-yellow-50 border-yellow-200';
      case 'draft': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'chapter' ? BookOpen : FileText;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <h2 className="font-semibold">Corkboard</h2>
          </div>
          <Button size="sm" onClick={handleAddScene}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        {corkboardItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Chapters Yet</h3>
            <p className="mb-4">Create your first chapter to get started</p>
            <Button onClick={handleAddScene}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Chapter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {corkboardItems.map((item) => {
              const Icon = getTypeIcon(item.type);
              
              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${getStatusColor(item.status)}`}
                  onClick={() => handleDocumentSelect(item.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-2">
                      <Icon className={`h-5 w-5 mt-1 ${item.type === 'chapter' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                          {item.title}
                        </h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
                    {item.synopsis && (
                      <p className="text-xs text-muted-foreground line-clamp-4 mb-3 flex-1">
                        {item.synopsis}
                      </p>
                    )}

                    <div className="mt-auto space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {item.wordCount?.toLocaleString() || 0} words
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-current/10">
                        <Badge className={getStatusColor(item.status).replace('bg-', 'text-').replace('border-', '') + ' bg-transparent'}>
                          {item.status.replace('-', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentSelect(item.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorkboardView;
