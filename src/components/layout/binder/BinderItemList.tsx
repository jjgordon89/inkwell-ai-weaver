
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import BinderItem from './BinderItem';
import type { DocumentNode } from '@/types/document';

interface BinderItemListProps {
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
  useVirtualization?: boolean;
  virtualizationOptions?: {
    itemHeight: number;
    overscan: number;
    containerHeight?: number;
  };
}

const BinderItemList: React.FC<BinderItemListProps> = ({
  filteredTree,
  expandedNodes,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onAddChild,
  onEdit
}) => {
  if (filteredTree.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No documents found</p>
      </div>
    );
  }

  return (
    <Droppable droppableId="root" type="DOCUMENT">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="space-y-1"
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
    </Droppable>
  );
};

export default BinderItemList;
