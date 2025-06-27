import React, { ReactNode } from 'react';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

interface ChildrenContainerProps {
  children: ReactNode;
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
  level?: number;
}

/**
 * A component that wraps children nodes with appropriate styling
 * Handles indentation and visual hierarchy
 * Provides proper container structure for nested items
 */
const ChildrenContainer: React.FC<ChildrenContainerProps> = ({
  children,
  provided,
  snapshot,
  level = 0
}) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`ml-4 ${
        snapshot.isDraggingOver ? 'bg-muted/20 rounded-md min-h-[40px]' : ''
      }`}
      style={{
        paddingLeft: level > 0 ? `${level * 8}px` : undefined
      }}
    >
      {children}
      {provided.placeholder}
    </div>
  );
};

export default ChildrenContainer;