
import React from 'react';
import { GripVertical } from 'lucide-react';
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface DragHandleProps {
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isPermanentManuscript?: boolean;
}

const DragHandle: React.FC<DragHandleProps> = ({ dragHandleProps, isPermanentManuscript }) => {
  if (isPermanentManuscript || !dragHandleProps) {
    return <div className="w-4 h-4" />; // Spacer
  }

  return (
    <div
      {...dragHandleProps}
      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  );
};

export default DragHandle;
