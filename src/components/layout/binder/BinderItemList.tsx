import React from 'react';
import DroppableWrapper from './DroppableWrapper';
import { BinderItem } from './BinderItem';
import type { DocumentNode } from '@/types/document';
import { useBinderContext } from './BinderContext';

interface BinderItemListProps {
  nodes: DocumentNode[];
  level: number;
  parentId?: string;
}

export const BinderItemList: React.FC<BinderItemListProps> = React.memo(({
  nodes,
  level,
  parentId = 'root'
}) => {
  const { expandedNodes, selectedId, onSelect, onToggle, onDelete, onAddChild, onEdit } = useBinderContext();

  return (
    <DroppableWrapper droppableId={parentId} type="DOCUMENT">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${level === 0 ? 'space-y-1 min-h-[100px]' : 'ml-4'} ${
            snapshot.isDraggingOver ? 'bg-muted/20 rounded-md' : ''
          } ${level === 0 ? '' : 'min-h-[40px]'}`}
        >
          {nodes.map((node, index) => (
            <BinderItem
              key={node.id}
              node={node}
              index={index}
              level={level}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </DroppableWrapper>
  );
});

BinderItemList.displayName = 'BinderItemList';