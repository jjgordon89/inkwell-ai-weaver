import React from 'react';
import { BinderProvider } from './BinderContext';
import { BinderItemList } from './BinderItemList';
import { EmptyState } from './EmptyState';
import type { DocumentNode } from '@/types/document';

interface BinderTreeProps {
  filteredTree: DocumentNode[];
  expandedNodes: Set<string>;
  selectedId?: string;
  onSelect: (node: DocumentNode) => void;
  onToggle: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: DocumentNode) => void;
  searchQuery: string;
  statusFilter: string;
  onClearFilters: () => void;
}

export const BinderTree: React.FC<BinderTreeProps> = ({
  filteredTree,
  expandedNodes,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onAddChild,
  onEdit,
  searchQuery,
  statusFilter,
  onClearFilters
}) => {
  if (filteredTree.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <BinderProvider
      initialExpandedNodes={expandedNodes}
      initialSelectedId={selectedId}
      onSelect={onSelect}
      onDelete={onDelete}
      onAddChild={onAddChild}
      onEdit={onEdit}
    >
      <BinderItemList nodes={filteredTree} level={0} />
    </BinderProvider>
  );
};

export default BinderTree;
