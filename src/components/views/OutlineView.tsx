
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Folder, Edit } from 'lucide-react';

const OutlineView = () => {
  const { state, dispatch } = useProject();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = state.flatDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.synopsis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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

  const handleDocumentSelect = (doc: any) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: doc.id });
    dispatch({ 
      type: 'SET_ACTIVE_VIEW', 
      payload: { id: 'editor', name: 'Editor', type: 'editor' } 
    });
  };

  const handleAddDocument = () => {
    const newDoc = {
      id: crypto.randomUUID(),
      title: 'New Document',
      type: 'document' as const,
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: state.flatDocuments.length,
      synopsis: ''
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
  };

  return (
    <div className="h-full p-6 bg-background">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Outline</h1>
          <Button onClick={handleAddDocument}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
        
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <Card 
            key={doc.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDocumentSelect(doc)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getTypeIcon(doc.type)}
                  {doc.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status.replace('-', ' ')}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {doc.synopsis && (
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm">
                  {doc.synopsis}
                </p>
              </CardContent>
            )}
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{doc.wordCount?.toLocaleString() || 0} words</span>
                <span>{doc.lastModified.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'Create your first document to get started.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OutlineView;
