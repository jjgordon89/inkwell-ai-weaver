import React from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

// This wrapper component uses default parameters instead of defaultProps
// to fix the warning: "Support for defaultProps will be removed from memo components"
const DroppableWrapper = ({
  droppableId,
  type = "DEFAULT", // Using default parameter instead of defaultProps
  direction = "vertical", // Using default parameter instead of defaultProps
  ignoreContainerClipping = false, // Using default parameter instead of defaultProps
  isDropDisabled = false, // Using default parameter instead of defaultProps
  isCombineEnabled = false, // Using default parameter instead of defaultProps
  renderClone,
  getContainerForClone,
  children,
  ...rest
}: DroppableProps) => {
  return (
    <Droppable
      droppableId={droppableId}
      type={type}
      direction={direction}
      ignoreContainerClipping={ignoreContainerClipping}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      renderClone={renderClone}
      getContainerForClone={getContainerForClone}
      {...rest}
    >
      {children}
    </Droppable>
  );
};

export default DroppableWrapper;