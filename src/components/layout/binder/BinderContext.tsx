import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DocumentNode } from '@/types/document';

interface BinderContextType {
  // Global state
  expandedNodes: Set<string>;
  selectedId: string | undefined;
  
  // Actions
  onSelect: (node: DocumentNode) => void;
  onToggle: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: DocumentNode) => void;
}

export const BinderContext = createContext<BinderContextType | undefined>(undefined);

export const useBinderContext = () => {
  const context = useContext(BinderContext);
  if (!context) {
    throw new Error('useBinderContext must be used within a BinderProvider');
  }
  return context;
};

interface BinderProviderProps {
  children: React.ReactNode;
  initialExpandedNodes?: Set<string>;
  initialSelectedId?: string;
  onSelect: (node: DocumentNode) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: DocumentNode) => void;
}

export const BinderProvider: React.FC<BinderProviderProps> = ({
  children,
  initialExpandedNodes = new Set(),
  initialSelectedId,
  onSelect: externalOnSelect,
  onDelete: externalOnDelete,
  onAddChild: externalOnAddChild,
  onEdit: externalOnEdit,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(initialExpandedNodes);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);

  const onToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const onSelect = useCallback((node: DocumentNode) => {
    setSelectedId(node.id);
    externalOnSelect(node);
  }, [externalOnSelect]);

  const value = {
    expandedNodes,
    selectedId,
    onSelect,
    onToggle,
    onDelete: externalOnDelete,
    onAddChild: externalOnAddChild,
    onEdit: externalOnEdit,
  };

  return (
    <BinderContext.Provider value={value}>
      {children}
    </BinderContext.Provider>
  );
};