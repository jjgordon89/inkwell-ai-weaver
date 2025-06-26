import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BinderTree } from '../BinderTree';
import { BinderProvider } from '../BinderContext';
import { useVirtualization } from '../hooks/useVirtualization';
import { useBinderDragDrop } from '../hooks/useBinderDragDrop';
import type { DocumentNode } from '@/types/document';
import { describe, it, expect, vi } from 'vitest';
import { DropResult, DragDropContext } from 'react-beautiful-dnd';

// Mock data
const mockNodes: DocumentNode[] = [
  {
    id: '1',
    title: 'Folder 1',
    type: 'folder',
    status: 'draft',
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 0,
    wordCount: 0,
    children: [
      {
        id: '1-1',
        title: 'Document 1-1',
        type: 'document',
        status: 'draft',
        labels: [],
        createdAt: new Date(),
        lastModified: new Date(),
        position: 0,
        wordCount: 1000
      },
      {
        id: '1-2',
        title: 'Document 1-2',
        type: 'document',
        status: 'draft',
        labels: [],
        createdAt: new Date(),
        lastModified: new Date(),
        position: 1,
        wordCount: 2000
      }
    ]
  },
  {
    id: '2',
    title: 'Folder 2',
    type: 'folder',
    status: 'draft',
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 1,
    wordCount: 0,
    children: [
      {
        id: '2-1',
        title: 'Document 2-1',
        type: 'document',
        status: 'draft',
        labels: [],
        createdAt: new Date(),
        lastModified: new Date(),
        position: 0,
        wordCount: 1500
      }
    ]
  }
];

// Wrapper component for testing hooks in a React context
const HookWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

describe('Binder Components', () => {
  describe('BinderTree', () => {
    it('should render the binder tree with nodes', () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      const onAddChild = vi.fn();
      const onEdit = vi.fn();
      const onToggle = vi.fn();
      const onDragEnd = vi.fn();

      render(
        <DragDropContext onDragEnd={onDragEnd}>
          <BinderProvider
            initialExpandedNodes={new Set()}
            onSelect={onSelect}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onEdit={onEdit}
          >
            <BinderTree
              filteredTree={mockNodes}
              expandedNodes={new Set()}
              onSelect={onSelect}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onToggle={onToggle}
              searchQuery=""
              statusFilter="all"
              onClearFilters={vi.fn()}
            />
          </BinderProvider>
        </DragDropContext>
      );

      expect(screen.getByText('Folder 1')).toBeInTheDocument();
      expect(screen.getByText('Folder 2')).toBeInTheDocument();
    });

    it('should show empty state when no nodes are provided', () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      const onAddChild = vi.fn();
      const onEdit = vi.fn();
      const onToggle = vi.fn();
      const onDragEnd = vi.fn();

      render(
        <DragDropContext onDragEnd={onDragEnd}>
          <BinderProvider
            initialExpandedNodes={new Set()}
            onSelect={onSelect}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onEdit={onEdit}
          >
            <BinderTree
              filteredTree={[]}
              expandedNodes={new Set()}
              onSelect={onSelect}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onToggle={onToggle}
              searchQuery=""
              statusFilter="all"
              onClearFilters={vi.fn()}
            />
          </BinderProvider>
        </DragDropContext>
      );

      expect(screen.getByText('No documents found')).toBeInTheDocument();
    });
  });

  describe('useVirtualization', () => {
    it('should calculate visible nodes correctly', () => {
      const expandedNodes = new Set(['1']);
      const TestComponent = () => {
        const { visibleNodes } = useVirtualization({
          nodes: mockNodes,
          expandedNodes,
          itemHeight: 40,
          containerHeight: 400,
          overscan: 2
        });
        return (
          <div>
            <div data-testid="visible-nodes">{visibleNodes.length}</div>
            <div data-testid="visible-nodes-ids">
              {visibleNodes.map(node => node.id).join(', ')}
            </div>
          </div>
        );
      };

      const { getByTestId } = render(
        <HookWrapper>
          <TestComponent />
        </HookWrapper>
      );

      console.log('Visible nodes:', getByTestId('visible-nodes-ids').textContent);
      expect(getByTestId('visible-nodes')).toHaveTextContent('4');
    });
  });

  describe('useBinderDragDrop', () => {
    it('should handle drag end correctly', () => {
      const onNodeMove = vi.fn();
      const TestComponent = () => {
        const { handleDragEnd } = useBinderDragDrop({ onNodeMove });
        return (
          <div>
            <button
              onClick={() => {
                const result = {
                  draggableId: '1-1',
                  source: { droppableId: '1', index: 0 },
                  destination: { droppableId: '2', index: 0 }
                };
                handleDragEnd(result as DropResult);
              }}
              data-testid="drag-end-button"
            />
          </div>
        );
      };

      const { getByTestId } = render(
        <HookWrapper>
          <TestComponent />
        </HookWrapper>
      );

      fireEvent.click(getByTestId('drag-end-button'));
      expect(onNodeMove).toHaveBeenCalledWith('1-1', '2', 0);
    });

    it('should ignore drag end if destination is null', () => {
      const onNodeMove = vi.fn();
      const TestComponent = () => {
        const { handleDragEnd } = useBinderDragDrop({ onNodeMove });
        return (
          <div>
            <button
              onClick={() => {
                const result = {
                  draggableId: '1-1',
                  source: { droppableId: '1', index: 0 },
                  destination: null
                };
                handleDragEnd(result as DropResult);
              }}
              data-testid="drag-end-button"
            />
          </div>
        );
      };

      const { getByTestId } = render(
        <HookWrapper>
          <TestComponent />
        </HookWrapper>
      );

      fireEvent.click(getByTestId('drag-end-button'));
      expect(onNodeMove).not.toHaveBeenCalled();
    });

    it('should ignore drag end if source and destination are the same', () => {
      const onNodeMove = vi.fn();
      const TestComponent = () => {
        const { handleDragEnd } = useBinderDragDrop({ onNodeMove });
        return (
          <div>
            <button
              onClick={() => {
                const result = {
                  draggableId: '1-1',
                  source: { droppableId: '1', index: 0 },
                  destination: { droppableId: '1', index: 0 }
                };
                handleDragEnd(result as DropResult);
              }}
              data-testid="drag-end-button"
            />
          </div>
        );
      };

      const { getByTestId } = render(
        <HookWrapper>
          <TestComponent />
        </HookWrapper>
      );

      fireEvent.click(getByTestId('drag-end-button'));
      expect(onNodeMove).not.toHaveBeenCalled();
    });
  });
});