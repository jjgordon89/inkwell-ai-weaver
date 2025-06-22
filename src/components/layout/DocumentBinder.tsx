import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentNode } from '@/types/document';
import BinderHeader from './binder/BinderHeader';
import BinderStats from './binder/BinderStats';
import BinderTree from './binder/BinderTree';
import TemplateDialog from '../dialogs/TemplateDialog';
import ImportDialog from '../dialogs/ImportDialog';
import ExportDialog from '../dialogs/ExportDialog';

const DocumentBinder = () => {
  const { state, dispatch } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

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

  const handleAddFolder = () => {
    const newFolder = {
      id: crypto.randomUUID(),
      title: 'New Folder',
      type: 'folder' as const,
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: state.documentTree.length
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newFolder });
  };

  const handleAddChild = (parentId: string) => {
    const parent = state.flatDocuments.find(doc => doc.id === parentId);
    const childType: 'chapter' | 'scene' = parent?.type === 'folder' ? 'chapter' : 'scene';
    
    const newDoc = {
      id: crypto.randomUUID(),
      title: childType === 'chapter' ? 'New Chapter' : 'New Scene',
      type: childType,
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
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
      <BinderHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTemplateClick={() => setShowTemplateDialog(true)}
        onAddDocument={handleAddDocument}
        onAddFolder={handleAddFolder}
        onImportClick={() => setShowImportDialog(true)}
        onExportClick={() => setShowExportDialog(true)}
      />
      
      {/* Stats */}
      <div className="px-4">
        <BinderStats totalWords={stats.totalWords} totalDocs={stats.totalDocs} />
      </div>
      
      {/* Document Tree */}
      <div className="flex-1 overflow-auto p-2">
        <BinderTree
          filteredTree={filteredTree}
          expandedNodes={expandedNodes}
          selectedId={state.activeDocumentId || undefined}
          onSelect={handleDocumentSelect}
          onToggle={handleNodeToggle}
          onDelete={handleDeleteDocument}
          onAddChild={handleAddChild}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Dialogs */}
      <TemplateDialog 
        open={showTemplateDialog} 
        onOpenChange={setShowTemplateDialog} 
      />
      <ImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
      <ExportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog} 
      />
    </div>
  );
};

export default DocumentBinder;
