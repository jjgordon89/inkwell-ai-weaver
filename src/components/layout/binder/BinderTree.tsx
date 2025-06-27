
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BinderItem from './BinderItem';
import DroppableWrapper from './DroppableWrapper';
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

const BinderTree = ({
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
    <DroppableWrapper droppableId="root" type="DOCUMENT">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-1 min-h-[100px] ${
            snapshot.isDraggingOver ? 'bg-muted/20 rounded-md' : ''
          }`}
        >
          {filteredTree.map((node, index) => (
            <BinderItem
              key={node.id}
              node={node}
              index={index}
              level={0}
              onSelect={onSelect}
              onToggle={onToggle}
              expandedNodes={expandedNodes}
              selectedId={selectedId}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onEdit={onEdit}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </DroppableWrapper>
  );
};

export default BinderTree;
