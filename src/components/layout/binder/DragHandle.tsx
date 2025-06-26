import React from 'react';
import { GripVertical } from 'lucide-react';
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface DragHandleProps {
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  isPermanentManuscript: boolean;
}

export const DragHandle: React.FC<DragHandleProps> = React.memo(({
  dragHandleProps,
  isPermanentManuscript
}) => {
  return (
    <div
      {...(!isPermanentManuscript ? dragHandleProps : {})}
      className={`opacity-0 group-hover:opacity-100 p-0 h-4 w-4 flex items-center justify-center rounded ${
        isPermanentManuscript 
          ? 'cursor-not-allowed opacity-30' 
          : 'hover:bg-accent cursor-grab active:cursor-grabbing'
      }`}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  );
});

DragHandle.displayName = 'DragHandle';