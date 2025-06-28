
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import ChildrenContainer from './ChildrenContainer';

const mockProvided: DroppableProvided = {
  innerRef: () => {},
  droppableProps: {
    'data-rbd-droppable-context-id': '1',
    'data-rbd-droppable-id': 'test'
  },
  placeholder: <div data-testid="placeholder" />
};

const mockSnapshot: DroppableStateSnapshot = {
  isDraggingOver: false,
  draggingOverWith: null,
  draggingFromThisWith: null,
  isUsingPlaceholder: false
};

describe('ChildrenContainer', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ChildrenContainer 
        provided={mockProvided} 
        snapshot={mockSnapshot}
        level={1}
      >
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('applies dragging over styles when snapshot indicates dragging', () => {
    const draggingSnapshot = { ...mockSnapshot, isDraggingOver: true };
    const { container } = render(
      <ChildrenContainer 
        provided={mockProvided} 
        snapshot={draggingSnapshot}
        level={1}
      >
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('bg-primary/5');
  });

  it('does not apply dragging styles when not dragging over', () => {
    const { container } = render(
      <ChildrenContainer 
        provided={mockProvided} 
        snapshot={mockSnapshot}
        level={1}
      >
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.querySelector('div');
    expect(containerDiv).not.toHaveClass('bg-primary/5');
  });

  it('includes placeholder from provided props', () => {
    const { getByTestId } = render(
      <ChildrenContainer 
        provided={mockProvided} 
        snapshot={mockSnapshot}
        level={1}
      >
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    expect(getByTestId('placeholder')).toBeInTheDocument();
  });

  it('applies correct indentation based on level', () => {
    const { container } = render(
      <ChildrenContainer 
        provided={mockProvided} 
        snapshot={mockSnapshot}
        level={2}
      >
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('ml-4');
  });

  it('maintains space-y-1 class for proper spacing', () => {
    const { container } = render(
      <ChildrenContainer 
        provided={mockProvided} 
        snapshot={mockSnapshot}
        level={1}
      >
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('space-y-1');
  });
});
