
import React, { useState } from 'react';
import { FileText, User, Globe, Settings, Search, Tag, Calendar, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';

const DocumentInspector = () => {
  const { state } = useProject();
  const activeDocument = state.flatDocuments.find(doc => doc.id === state.activeDocumentId);

  if (!activeDocument) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Select a document to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <p className="text-sm">{activeDocument.title}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Badge variant="outline" className="ml-2">
              {activeDocument.type}
            </Badge>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Badge variant="secondary" className="ml-2">
              {activeDocument.status}
            </Badge>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Word Count</label>
            <p className="text-sm font-mono">{activeDocument.wordCount.toLocaleString()}</p>
          </div>
          
          {activeDocument.targetWordCount && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Target</label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{activeDocument.targetWordCount.toLocaleString()}</p>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (activeDocument.wordCount / activeDocument.targetWordCount) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Synopsis</label>
            <Textarea 
              placeholder="Add a synopsis..."
              value={activeDocument.synopsis || ''}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {activeDocument.metadata && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeDocument.metadata.POV && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">POV</label>
                <p className="text-sm">{activeDocument.metadata.POV}</p>
              </div>
            )}
            
            {activeDocument.metadata.setting && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Setting</label>
                <p className="text-sm">{activeDocument.metadata.setting}</p>
              </div>
            )}
            
            {activeDocument.metadata.characters && activeDocument.metadata.characters.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Characters</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeDocument.metadata.characters.map((char, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CharacterInspector = () => {
  const { state } = useWriting();
  const selectedCharacter = state.characters.find(char => 
    state.selectedText && state.selectedText.toLowerCase().includes(char.name.toLowerCase())
  );

  if (!selectedCharacter) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Select text with character names to view details</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          {selectedCharacter.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <p className="text-sm mt-1">{selectedCharacter.description}</p>
        </div>
        
        {selectedCharacter.age && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Age</label>
            <p className="text-sm">{selectedCharacter.age}</p>
          </div>
        )}
        
        {selectedCharacter.occupation && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Occupation</label>
            <p className="text-sm">{selectedCharacter.occupation}</p>
          </div>
        )}
        
        {selectedCharacter.tags.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedCharacter.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectStats = () => {
  const { state } = useProject();
  
  const totalWords = state.flatDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
  const completedDocs = state.flatDocuments.filter(doc => doc.status === 'final').length;
  const inProgressDocs = state.flatDocuments.filter(doc => doc.status === 'draft' || doc.status === 'first-draft').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Project Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Words</p>
            <p className="text-lg font-semibold">{totalWords.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="text-lg font-semibold">{state.flatDocuments.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-semibold text-green-600">{completedDocs}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-lg font-semibold text-blue-600">{inProgressDocs}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InspectorPanel = () => {
  return (
    <div className="h-full w-80 border-l bg-background">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Inspector</h2>
      </div>
      
      <div className="h-full overflow-auto">
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="document" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Doc
            </TabsTrigger>
            <TabsTrigger value="character" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              Char
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Stats
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="document" className="mt-0">
              <DocumentInspector />
            </TabsContent>
            
            <TabsContent value="character" className="mt-0">
              <CharacterInspector />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-0">
              <ProjectStats />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default InspectorPanel;
