
import React from 'react';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

interface DroppableWrapperProps {
  droppableId: string;
  type: string;
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
}

const DroppableWrapper: React.FC<DroppableWrapperProps> = ({ droppableId, type, children }) => {
  return (
    <Droppable droppableId={droppableId} type={type}>
      {children}
    </Droppable>
  );
};

export default DroppableWrapper;
