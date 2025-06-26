import React from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

interface DroppableWrapperProps extends Omit<DroppableProps, 'children'> {
  children: DroppableProps['children'];
}

export const DroppableWrapper: React.FC<DroppableWrapperProps> = React.memo(({
  droppableId,
  type = "DEFAULT",
  direction = "vertical",
  ignoreContainerClipping = false,
  isDropDisabled = false,
  isCombineEnabled = false,
  renderClone,
  getContainerForClone,
  children,
  ...rest
}) => {
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
});

DroppableWrapper.displayName = 'DroppableWrapper';

export default DroppableWrapper;