import React from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import StatusIndicator from './StatusIndicator';
import TypeIcon from './TypeIcon';
import DragHandle from './DragHandle';
import ExpandCollapseButton from './ExpandCollapseButton';
import ItemTitle from './ItemTitle';
import WordCount from './WordCount';
import ItemActions from './ItemActions';
import type { DocumentNode } from '@/types/document';

interface BinderItemContentProps {
  node: DocumentNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  isPermanentManuscript: boolean;
  isDragging?: boolean;
  isEditing?: boolean;
  onToggle: () => void;
  onStartEditing?: () => void;
  onTitleChange?: (newTitle: string) => void;
  onEditComplete?: () => void;
}

const BinderItemContent: React.FC<BinderItemContentProps> = ({
  node,
  level,
  isSelected,
  isExpanded,
  hasChildren,
  dragHandleProps,
  isPermanentManuscript,
  isDragging = false,
  isEditing = false,
  onToggle,
  onStartEditing,
  onTitleChange,
  onEditComplete
}) => {
  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 cursor-pointer rounded-sm transition-colors ${
        isSelected ? 'bg-muted border-l-2 border-l-primary' : ''
      } ${isDragging ? 'bg-accent' : ''} ${
        isPermanentManuscript ? 'border-l-2 border-l-blue-500' : ''
      }`}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
    >
      {/* Drag handle */}
      <DragHandle 
        dragHandleProps={dragHandleProps} 
        isPermanent={isPermanentManuscript} 
      />

      {/* Expand/Collapse button */}
      <ExpandCollapseButton 
        isExpanded={isExpanded} 
        hasChildren={hasChildren} 
        onToggle={onToggle} 
      />
      
      {/* Type icon */}
      <TypeIcon type={node.type} />
      
      {/* Item title */}
      <ItemTitle 
        title={node.title} 
        isEditing={isEditing}
        onTitleChange={onTitleChange}
        onEditComplete={onEditComplete}
      />
      
      {/* Status indicator */}
      <StatusIndicator status={node.status} />
      
      {/* Word count */}
      <WordCount wordCount={node.wordCount} />

      {/* Actions menu */}
      <ItemActions 
        node={node} 
        onStartEditing={onStartEditing}
      />
    </div>
  );
};

export default BinderItemContent;