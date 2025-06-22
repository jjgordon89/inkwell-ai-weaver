
import React, { useState, useCallback } from 'react';
import { FileText, Edit3, Save, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from "@/hooks/use-toast";

const EditorView = () => {
  const { state, dispatch } = useProject();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  const activeDocument = state.flatDocuments.find(doc => doc.id === state.activeDocumentId);

  const handleContentChange = useCallback((newContent: string) => {
    if (!activeDocument) return;

    // Calculate word count
    const words = newContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Update document content
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: {
          content: newContent,
          wordCount: words.length,
          lastModified: new Date()
        }
      }
    });
    
    setHasUnsavedChanges(true);
  }, [activeDocument, dispatch]);

  const handleSave = () => {
    if (!activeDocument) return;
    
    setHasUnsavedChanges(false);
    toast({
      title: "Document saved",
      description: `"${activeDocument.title}" has been saved successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'revised': return 'bg-blue-100 text-blue-800';
      case 'first-draft': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit3 className="h-4 w-4" />
            <h2 className="font-semibold">{activeDocument.title}</h2>
            <Badge className={getStatusColor(activeDocument.status)}>
              {activeDocument.status}
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                Unsaved
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {wordCount.toLocaleString()} words
            </div>
            
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto h-full">
          <textarea
            className="w-full h-full min-h-96 p-6 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-base leading-relaxed"
            placeholder="Start writing your story..."
            value={activeDocument.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            style={{ fontFamily: 'Georgia, serif' }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorView;
