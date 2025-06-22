
import React, { useState } from 'react';
import { Info, FileText, Tag, Calendar, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProject } from '@/contexts/ProjectContext';

const DocumentInspector = () => {
  const { state, dispatch } = useProject();
  const activeDocument = state.flatDocuments.find(doc => doc.id === state.activeDocumentId);
  const [synopsis, setSynopsis] = useState(activeDocument?.synopsis || '');
  const [notes, setNotes] = useState(activeDocument?.metadata?.notes || '');

  if (!activeDocument) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Select a document to view details</p>
      </div>
    );
  }

  const handleSaveSynopsis = () => {
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: { synopsis }
      }
    });
  };

  const handleSaveNotes = () => {
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: {
          metadata: {
            ...activeDocument.metadata,
            notes
          }
        }
      }
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

  return (
    <div className="space-y-4">
      {/* Document Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{activeDocument.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <Badge variant="outline">{activeDocument.type}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge className={getStatusColor(activeDocument.status)}>
              {activeDocument.status.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Word Count</span>
            <span className="font-medium">{activeDocument.wordCount?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Modified</span>
            <span className="text-xs">{activeDocument.lastModified.toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Synopsis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Synopsis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Brief description of this document..."
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="min-h-20"
          />
          <Button 
            size="sm" 
            onClick={handleSaveSynopsis}
            disabled={synopsis === (activeDocument.synopsis || '')}
          >
            Save Synopsis
          </Button>
        </CardContent>
      </Card>

      {/* Metadata */}
      {activeDocument.metadata && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeDocument.metadata.POV && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">POV</span>
                <span>{activeDocument.metadata.POV}</span>
              </div>
            )}
            
            {activeDocument.metadata.setting && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Setting</span>
                <span>{activeDocument.metadata.setting}</span>
              </div>
            )}
            
            {activeDocument.metadata.characters && activeDocument.metadata.characters.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Characters</div>
                <div className="flex flex-wrap gap-1">
                  {activeDocument.metadata.characters.map((char, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Personal notes about this document..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24"
          />
          <Button 
            size="sm" 
            onClick={handleSaveNotes}
            disabled={notes === (activeDocument.metadata?.notes || '')}
          >
            Save Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const InspectorPanel = () => {
  return (
    <div className="h-full border-l bg-background">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <h2 className="font-semibold">Inspector</h2>
        </div>
      </div>

      <Tabs defaultValue="document" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
          <TabsTrigger value="document" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Document
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="flex-1 p-4 pt-4 overflow-auto">
          <DocumentInspector />
        </TabsContent>

        <TabsContent value="stats" className="flex-1 p-4 pt-4 overflow-auto">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Document statistics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InspectorPanel;
