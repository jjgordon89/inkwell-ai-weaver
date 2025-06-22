
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BinderItem from './BinderItem';
import type { DocumentNode } from '@/types/document';

interface BinderTreeProps {
  filteredTree: DocumentNode[];
  expandedNodes: Set<string>;
  selectedId?: string;
  onSelect: (node: DocumentNode) => void;
  onToggle: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  searchQuery: string;
  statusFilter: string;
  onClearFilters: () => void;
}

const BinderTree = ({
  filteredTree,
  expandedNodes,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onAddChild,
  searchQuery,
  statusFilter,
  onClearFilters
}: BinderTreeProps) => {
  if (filteredTree.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No documents found</p>
        {(searchQuery || statusFilter !== 'all') && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={onClearFilters}
            className="mt-2"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredTree.map((node) => (
        <BinderItem
          key={node.id}
          node={node}
          level={0}
          onSelect={onSelect}
          onToggle={onToggle}
          expandedNodes={expandedNodes}
          selectedId={selectedId}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
};

export default BinderTree;
