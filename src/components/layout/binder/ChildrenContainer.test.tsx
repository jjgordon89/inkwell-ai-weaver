import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChildrenContainer from './ChildrenContainer';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

describe('ChildrenContainer', () => {
  // Setup mock provided and snapshot objects
  const createMockProvided = (): DroppableProvided => ({
    innerRef: vi.fn(),
    droppableProps: {
      'data-rbd-droppable-id': 'test-droppable',
      'data-rbd-droppable-context-id': 'test-context'
    },
    placeholder: <div data-testid="placeholder" />
  });

  const createMockSnapshot = (isDraggingOver: boolean): DroppableStateSnapshot => ({
    isDraggingOver,
    draggingOverWith: isDraggingOver ? 'test-draggable' : null,
    draggingFromThisWith: null,
    isUsingPlaceholder: false
  });

  it('renders children correctly', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    
    render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot}>
        <div data-testid="child-element">Test Child</div>
      </ChildrenContainer>
    );
    
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByTestId('child-element')).toHaveTextContent('Test Child');
  });

  it('applies the correct styling when isDraggingOver is true', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(true);
    
    const { container } = render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('bg-muted/20');
    expect(containerDiv).toHaveClass('rounded-md');
    expect(containerDiv).toHaveClass('min-h-[40px]');
  });

  it('applies the correct styling when isDraggingOver is false', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    
    const { container } = render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('ml-4');
    expect(containerDiv).not.toHaveClass('bg-muted/20');
    expect(containerDiv).not.toHaveClass('rounded-md');
    expect(containerDiv).not.toHaveClass('min-h-[40px]');
  });

  it('applies the correct paddingLeft style based on the level prop', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    const level = 3;
    const expectedPadding = `${level * 8}px`;
    
    const { container } = render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot} level={level}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.style.paddingLeft).toBe(expectedPadding);
  });

  it('does not apply paddingLeft style when level is 0', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    
    const { container } = render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot} level={0}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.style.paddingLeft).toBe('');
  });

  it('uses default level value of 0 when not provided', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    
    const { container } = render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.style.paddingLeft).toBe('');
  });

  it('passes the provided props to the div element', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    
    const { container } = render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveAttribute('data-rbd-droppable-id', 'test-droppable');
  });

  it('renders the provided placeholder', () => {
    const mockProvided = createMockProvided();
    const mockSnapshot = createMockSnapshot(false);
    
    render(
      <ChildrenContainer provided={mockProvided} snapshot={mockSnapshot}>
        <div>Test Child</div>
      </ChildrenContainer>
    );
    
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });
});