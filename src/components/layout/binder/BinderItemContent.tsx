import React from 'react';
import { DragHandle } from './DragHandle';
import { ExpandCollapseButton } from './ExpandCollapseButton';
import { TypeIcon } from './TypeIcon';
import { ItemTitle } from './ItemTitle';
import { StatusIndicator } from './StatusIndicator';
import { WordCount } from './WordCount';
import { ItemActions } from './ItemActions';
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface BinderItemContentProps {
  node: DocumentNode;
  level: number;
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  isPermanentManuscript: boolean;
}

export const BinderItemContent: React.FC<BinderItemContentProps> = React.memo(({
  node,
  level,
  isDragging,
  dragHandleProps,
  isPermanentManuscript
}) => {
  const { selectedId, onSelect } = useBinderContext();
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 cursor-pointer rounded-sm transition-colors ${
        isSelected ? 'bg-muted border-l-2 border-l-primary' : ''
      } ${isDragging ? 'bg-accent' : ''} ${
        isPermanentManuscript ? 'border-l-2 border-l-blue-500' : ''
      }`}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={() => onSelect(node)}
    >
      <DragHandle 
        dragHandleProps={dragHandleProps} 
        isPermanentManuscript={isPermanentManuscript} 
      />
      
      <ExpandCollapseButton 
        node={node} 
        hasChildren={hasChildren} 
      />
      
      <TypeIcon type={node.type} />
      
      <ItemTitle title={node.title} />
      
      <StatusIndicator status={node.status} />
      
      <WordCount wordCount={node.wordCount} />
      
      <ItemActions 
        node={node} 
        isPermanentManuscript={isPermanentManuscript} 
        canHaveChildren={node.type === 'folder' || node.type === 'chapter'} 
      />
    </div>
  );
});

BinderItemContent.displayName = 'BinderItemContent';