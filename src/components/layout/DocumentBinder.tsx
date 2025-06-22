
import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, ChevronDown, FileText, Folder, BookOpen, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentNode } from '@/types/document';

interface BinderItemProps {
  node: DocumentNode;
  level: number;
  onSelect: (node: DocumentNode) => void;
  onToggle: (nodeId: string) => void;
  expandedNodes: Set<string>;
  selectedId?: string;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
}

const BinderItem = ({ 
  node, 
  level, 
  onSelect, 
  onToggle, 
  expandedNodes, 
  selectedId, 
  onDelete, 
  onAddChild 
}: BinderItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
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
      case 'final': return 'bg-green-500';
      case 'revised': return 'bg-blue-500';
      case 'first-draft': return 'bg-yellow-500';
      case 'draft': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 cursor-pointer rounded-sm transition-colors ${
          isSelected ? 'bg-muted border-l-2 border-l-primary' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0 h-4 w-4 flex items-center justify-center hover:bg-accent rounded"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        
        {getTypeIcon()}
        
        <span className="flex-1 text-sm font-medium truncate">{node.title}</span>
        
        {/* Status indicator */}
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        
        {node.wordCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {(node.wordCount / 1000).toFixed(1)}k
          </span>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelect(node)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {(node.type === 'folder' || node.type === 'chapter') && (
              <DropdownMenuItem onClick={() => onAddChild(node.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(node.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <BinderItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              expandedNodes={expandedNodes}
              selectedId={selectedId}
              onDelete={onDelete}
              onAddChild={onAddChild}
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1'])); // Expand root by default

  const handleDocumentSelect = (node: DocumentNode) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: node.id });
    // Switch to editor view when selecting a non-folder document
    if (node.type !== 'folder') {
      dispatch({ 
        type: 'SET_ACTIVE_VIEW', 
        payload: { id: 'editor', name: 'Editor', type: 'editor' } 
      });
    }
  };

  const handleNodeToggle = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
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

  const handleAddChild = (parentId: string) => {
    const parent = state.flatDocuments.find(doc => doc.id === parentId);
    const childType = parent?.type === 'folder' ? 'chapter' : 'scene';
    
    const newDoc = {
      id: crypto.randomUUID(),
      title: childType === 'chapter' ? 'New Chapter' : 'New Scene',
      type: childType as const,
      parentId,
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: 0
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
    
    // Expand parent node
    setExpandedNodes(prev => new Set([...prev, parentId]));
  };

  const handleDeleteDocument = (docId: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: docId });
  };

  // Filter documents based on search and status
  const filteredTree = useMemo(() => {
    if (!searchQuery && statusFilter === 'all') {
      return state.documentTree;
    }

    const filterNode = (node: DocumentNode): DocumentNode | null => {
      const matchesSearch = !searchQuery || 
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.synopsis?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
      
      const filteredChildren = node.children?.map(filterNode).filter(Boolean) as DocumentNode[] || [];
      
      if (matchesSearch && matchesStatus) {
        return { ...node, children: filteredChildren };
      } else if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      
      return null;
    };

    return state.documentTree.map(filterNode).filter(Boolean) as DocumentNode[];
  }, [state.documentTree, searchQuery, statusFilter]);

  const getTotalStats = () => {
    const totalWords = state.flatDocuments.reduce((sum, doc) => sum + (doc.wordCount || 0), 0);
    const totalDocs = state.flatDocuments.length;
    return { totalWords, totalDocs };
  };

  const stats = getTotalStats();

  return (
    <div className="h-full flex flex-col border-r bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Binder</h2>
          <Button size="sm" onClick={handleAddDocument}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="first-draft">First Draft</SelectItem>
              <SelectItem value="revised">Revised</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Words</div>
              <div className="font-semibold">{stats.totalWords.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Documents</div>
              <div className="font-semibold">{stats.totalDocs}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Tree */}
      <div className="flex-1 overflow-auto p-2">
        {filteredTree.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents found</p>
            {(searchQuery || statusFilter !== 'all') && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTree.map((node) => (
              <BinderItem
                key={node.id}
                node={node}
                level={0}
                onSelect={handleDocumentSelect}
                onToggle={handleNodeToggle}
                expandedNodes={expandedNodes}
                selectedId={state.activeDocumentId || undefined}
                onDelete={handleDeleteDocument}
                onAddChild={handleAddChild}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentBinder;
