
import React, { useState } from 'react';
import { List, ChevronRight, ChevronDown, FileText, Folder, BookOpen, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentNode } from '@/types/document';

interface OutlineItemProps {
  node: DocumentNode;
  level: number;
  onSelect: (node: DocumentNode) => void;
  selectedId?: string;
}

const OutlineItem = ({ node, level, onSelect, selectedId }: OutlineItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const getTypeIcon = () => {
    switch (node.type) {
      case 'folder': return <Folder className="h-4 w-4 text-blue-500" />;
      case 'chapter': return <BookOpen className="h-4 w-4 text-primary" />;
      case 'scene': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (node.status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'revised': return 'bg-blue-100 text-blue-800';
      case 'first-draft': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer rounded-sm ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0 h-4 w-4 flex items-center justify-center"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        
        {getTypeIcon()}
        
        <span className="flex-1 text-sm font-medium">{node.title}</span>
        
        {node.wordCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {node.wordCount.toLocaleString()}w
          </span>
        )}
        
        <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
          {node.status.replace('-', ' ')}
        </Badge>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <OutlineItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OutlineView = () => {
  const { state, dispatch } = useProject();

  const handleDocumentSelect = (node: DocumentNode) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: node.id });
    // Switch to editor view when selecting a document
    if (node.type !== 'folder') {
      dispatch({ 
        type: 'SET_ACTIVE_VIEW', 
        payload: { id: 'editor', name: 'Editor', type: 'editor' } 
      });
    }
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
      position: state.documentTree.length
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
  };

  const getTotalWordCount = () => {
    return state.flatDocuments.reduce((total, doc) => total + (doc.wordCount || 0), 0);
  };

  const getDocumentStats = () => {
    const stats = {
      total: state.flatDocuments.length,
      chapters: state.flatDocuments.filter(d => d.type === 'chapter').length,
      scenes: state.flatDocuments.filter(d => d.type === 'scene').length,
      completed: state.flatDocuments.filter(d => d.status === 'final').length
    };
    return stats;
  };

  const stats = getDocumentStats();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <h2 className="font-semibold">Outline</h2>
          </div>
          <Button size="sm" onClick={handleAddDocument}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Total Words</div>
            <div className="font-semibold">{getTotalWordCount().toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Documents</div>
            <div className="font-semibold">{stats.total}</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {state.documentTree.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
            <p className="mb-4">Create your first document to get started</p>
            <Button onClick={handleAddDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {state.documentTree.map((node) => (
              <OutlineItem
                key={node.id}
                node={node}
                level={0}
                onSelect={handleDocumentSelect}
                selectedId={state.activeDocumentId || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlineView;
