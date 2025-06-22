
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentNode } from '@/types/document';

interface DocumentTreeItemProps {
  node: DocumentNode;
  level: number;
  onSelect: (node: DocumentNode) => void;
  selectedId?: string;
}

const DocumentTreeItem = ({ node, level, onSelect, selectedId }: DocumentTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { dispatch } = useProject();

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const getTypeIcon = () => {
    switch (node.type) {
      case 'folder': return <Folder className="h-4 w-4" />;
      case 'chapter': return <FileText className="h-4 w-4 text-primary" />;
      case 'scene': return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'character-sheet': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'research-note': return <FileText className="h-4 w-4 text-green-500" />;
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

  const handleAddDocument = (type: DocumentNode['type']) => {
    const newDoc: DocumentNode = {
      id: crypto.randomUUID(),
      title: `New ${type}`,
      type,
      parentId: node.id,
      status: 'not-started',
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: (node.children?.length || 0)
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer rounded-sm ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0 h-4 w-4"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        {getTypeIcon()}
        
        <span className="flex-1 text-sm truncate">{node.title}</span>
        
        {node.wordCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {node.wordCount.toLocaleString()}
          </span>
        )}
        
        <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
          {node.status}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddDocument('document')}>
              Add Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddDocument('folder')}>
              Add Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddDocument('scene')}>
              Add Scene
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <DocumentTreeItem
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

const DocumentBinder = () => {
  const { state, dispatch } = useProject();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDocumentSelect = (node: DocumentNode) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: node.id });
  };

  const handleAddRootDocument = () => {
    const newDoc: DocumentNode = {
      id: crypto.randomUUID(),
      title: 'New Document',
      type: 'document',
      status: 'not-started',
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: state.documentTree.length
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
  };

  const filteredTree = searchQuery
    ? state.documentTree.filter(node => 
        node.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : state.documentTree;

  return (
    <div className="h-full flex flex-col border-r bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Binder</h2>
          <Button variant="ghost" size="sm" onClick={handleAddRootDocument}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
      </div>

      <div className="flex-1 overflow-auto p-2">
        {filteredTree.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents yet</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleAddRootDocument}>
              Create First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTree.map((node) => (
              <DocumentTreeItem
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

export default DocumentBinder;
