
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { BinderItemContent } from './BinderItemContent';
import { ChildrenContainer } from './ChildrenContainer';
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';

interface BinderItemProps {
  node: DocumentNode;
  index: number;
  level: number;
}

export const BinderItem: React.FC<BinderItemProps> = React.memo(({
  node,
  index,
  level
}) => {
  const { expandedNodes } = useBinderContext();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const canHaveChildren = node.type === 'folder' || node.type === 'chapter';
  
  // Check if this is the permanent Manuscript folder
  const isPermanentManuscript = node.id === 'manuscript-root' ||
    (node.title === 'Manuscript' && node.type === 'folder' && node.labels?.includes('permanent'));

  return (
    <Draggable
      draggableId={node.id}
      index={index}
      isDragDisabled={isPermanentManuscript}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <BinderItemContent
            node={node}
            level={level}
            isDragging={snapshot.isDragging}
            dragHandleProps={provided.dragHandleProps || null}
            isPermanentManuscript={isPermanentManuscript}
          />
          
          {hasChildren && isExpanded && canHaveChildren && (
            <ChildrenContainer
              nodeId={node.id}
              children={node.children!}
              level={level}
            />
          )}
        </div>
      )}
    </Draggable>
  );
});

BinderItem.displayName = 'BinderItem';
