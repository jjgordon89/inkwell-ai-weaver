import React from 'react';
import { GripVertical } from 'lucide-react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface DragHandleProps {
  dragHandleProps?: DraggableProvidedDragHandleProps;
  isPermanent: boolean;
}

const DragHandle: React.FC<DragHandleProps> = ({ dragHandleProps, isPermanent }) => {
  return (
    <div
      {...(!isPermanent ? dragHandleProps : {})}
      className={`opacity-0 group-hover:opacity-100 p-0 h-4 w-4 flex items-center justify-center rounded ${
        isPermanent 
          ? 'cursor-not-allowed opacity-30' 
          : 'hover:bg-accent cursor-grab active:cursor-grabbing'
      }`}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  );
};

export default DragHandle;