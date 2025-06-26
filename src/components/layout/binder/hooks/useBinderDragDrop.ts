import { useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import type { DocumentNode } from '@/types/document';

interface UseBinderDragDropOptions {
  onNodeMove: (sourceId: string, destinationId: string, position: number) => void;
}

export const useBinderDragDrop = ({ onNodeMove }: UseBinderDragDropOptions) => {
  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle the move
    onNodeMove(
      result.draggableId,
      destination.droppableId,
      destination.index
    );
  }, [onNodeMove]);

  return { handleDragEnd };
};