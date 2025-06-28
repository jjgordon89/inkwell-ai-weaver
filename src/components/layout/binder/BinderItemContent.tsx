
import React, { useState } from 'react';
import TypeIcon from './TypeIcon';
import ItemTitle from './ItemTitle';
import StatusIndicator from './StatusIndicator';
import WordCount from './WordCount';
import ItemActions from './ItemActions';
import ExpandCollapseButton from './ExpandCollapseButton';
import DragHandle from './DragHandle';
import type { DocumentNode } from '@/types/document';
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface BinderItemContentProps {
  node: DocumentNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isPermanentManuscript: boolean;
  isDragging?: boolean;
  onToggle: () => void;
  onStartEditing: () => void;
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
  onToggle,
  onStartEditing
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEditing = () => {
    setIsEditing(true);
    onStartEditing();
  };

  const handleTitleChange = (newTitle: string) => {
    // This would typically update the document through context
    console.log('Title changed to:', newTitle);
  };

  const handleEditComplete = () => {
    setIsEditing(false);
  };

  return (
    <div
      className={`
        group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors
        ${isSelected ? 'bg-primary/10 border border-primary/20' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
    >
      <DragHandle dragHandleProps={dragHandleProps} isPermanentManuscript={isPermanentManuscript} />
      
      <ExpandCollapseButton
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggle={onToggle}
      />
      
      <TypeIcon type={node.type} />
      
      <div className="flex-1 min-w-0">
        <ItemTitle
          node={node}
          isEditing={isEditing}
          onTitleChange={handleTitleChange}
          onEditComplete={handleEditComplete}
        />
      </div>
      
      <StatusIndicator status={node.status} />
      
      <WordCount count={node.wordCount} />
      
      <ItemActions node={node} onStartEditing={handleStartEditing} />
    </div>
  );
};

export default BinderItemContent;
