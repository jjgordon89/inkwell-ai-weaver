
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DroppableWrapper from './DroppableWrapper';
import BinderItemContent from './BinderItemContent';
import ChildrenContainer from './ChildrenContainer';
import type { DocumentNode } from '@/types/document';

interface BinderItemProps {
  node: DocumentNode;
  index: number;
  level: number;
  onSelect: (node: DocumentNode) => void;
  onToggle: (nodeId: string) => void;
  expandedNodes: Set<string>;
  selectedId?: string;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: DocumentNode) => void;
}

const BinderItem = ({ 
  node, 
  index,
  level, 
  onSelect, 
  onToggle, 
  expandedNodes, 
  selectedId, 
  onDelete, 
  onAddChild,
  onEdit
}: BinderItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedId === node.id;
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
            isSelected={isSelected}
            isExpanded={isExpanded}
            hasChildren={Boolean(hasChildren)}
            dragHandleProps={!isPermanentManuscript && provided.dragHandleProps ? provided.dragHandleProps : undefined}
            isPermanentManuscript={isPermanentManuscript}
            isDragging={snapshot.isDragging}
            onToggle={() => onToggle(node.id)}
            onStartEditing={() => onEdit(node)}
          />
          
          {hasChildren && isExpanded && canHaveChildren && (
            <DroppableWrapper droppableId={node.id} type="DOCUMENT">
              {(provided, snapshot) => (
                <ChildrenContainer
                  provided={provided}
                  snapshot={snapshot}
                  level={level}
                >
                  {node.children!.map((child, childIndex) => (
                    <BinderItem
                      key={child.id}
                      node={child}
                      index={childIndex}
                      level={level + 1}
                      onSelect={onSelect}
                      onToggle={onToggle}
                      expandedNodes={expandedNodes}
                      selectedId={selectedId}
                      onDelete={onDelete}
                      onAddChild={onAddChild}
                      onEdit={onEdit}
                    />
                  ))}
                </ChildrenContainer>
              )}
            </DroppableWrapper>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default BinderItem;
