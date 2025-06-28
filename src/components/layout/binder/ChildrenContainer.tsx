
import React from 'react';
import type { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

interface ChildrenContainerProps {
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
  level: number;
  children: React.ReactNode;
}

const ChildrenContainer: React.FC<ChildrenContainerProps> = ({
  provided,
  snapshot,
  level,
  children
}) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`
        ml-4 space-y-1
        ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-md' : ''}
      `}
    >
      {children}
      {provided.placeholder}
    </div>
  );
};

export default ChildrenContainer;
