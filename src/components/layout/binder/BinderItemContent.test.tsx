import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BinderItemContent from './BinderItemContent';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

// Mock all child components
vi.mock('./StatusIndicator', () => ({
  default: vi.fn(() => <div data-testid="status-indicator" />)
}));

vi.mock('./TypeIcon', () => ({
  default: vi.fn(() => <div data-testid="type-icon" />)
}));

vi.mock('./DragHandle', () => ({
  default: vi.fn(() => <div data-testid="drag-handle" />)
}));

vi.mock('./ExpandCollapseButton', () => ({
  default: vi.fn(() => <div data-testid="expand-collapse-button" />)
}));

vi.mock('./ItemTitle', () => ({
  default: vi.fn(() => <div data-testid="item-title" />)
}));

vi.mock('./WordCount', () => ({
  default: vi.fn(() => <div data-testid="word-count" />)
}));

vi.mock('./ItemActions', () => ({
  default: vi.fn(() => <div data-testid="item-actions" />)
}));

// Import the mocked components to check their props
import StatusIndicator from './StatusIndicator';
import TypeIcon from './TypeIcon';
import DragHandle from './DragHandle';
import ExpandCollapseButton from './ExpandCollapseButton';
import ItemTitle from './ItemTitle';
import WordCount from './WordCount';
import ItemActions from './ItemActions';

// Create a mock DocumentNode type for testing
type DocumentNodeType = "document" | "folder" | "chapter" | "scene" | "character-sheet" | "research-note" | "timeline-event";
type DocumentStatusType = "draft" | "not-started" | "first-draft" | "revised" | "final";

interface MockDocumentNode {
  id: string;
  title: string;
  type: DocumentNodeType;
  status: DocumentStatusType;
  wordCount: number;
  labels: string[];
  createdAt: Date;
  lastModified: Date;
  position: number;
}

describe('BinderItemContent', () => {
  // Mock document node for testing
  const mockNode: MockDocumentNode = {
    id: 'doc-1',
    title: 'Test Document',
    type: "document" as DocumentNodeType,
    status: "draft" as DocumentStatusType,
    wordCount: 1000,
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 1,
  };

  // Mock props
  const mockDragHandleProps: DraggableProvidedDragHandleProps = {
    'data-rbd-drag-handle-draggable-id': 'draggable-1',
    'data-rbd-drag-handle-context-id': 'context-1',
    'aria-describedby': 'draggable-description',
    role: 'button',
    tabIndex: 0,
    draggable: true,
    onDragStart: vi.fn(),
  };
  const mockOnToggle = vi.fn();
  const mockOnStartEditing = vi.fn();
  const mockOnTitleChange = vi.fn();
  const mockOnEditComplete = vi.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    (StatusIndicator as jest.Mock).mockClear();
    (TypeIcon as jest.Mock).mockClear();
    (DragHandle as jest.Mock).mockClear();
    (ExpandCollapseButton as jest.Mock).mockClear();
    (ItemTitle as jest.Mock).mockClear();
    (WordCount as jest.Mock).mockClear();
    (ItemActions as jest.Mock).mockClear();
  });

  it('renders all child components', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that all child components are rendered
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    expect(screen.getByTestId('expand-collapse-button')).toBeInTheDocument();
    expect(screen.getByTestId('type-icon')).toBeInTheDocument();
    expect(screen.getByTestId('item-title')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('word-count')).toBeInTheDocument();
    expect(screen.getByTestId('item-actions')).toBeInTheDocument();
  });

  it('applies correct styling when isSelected is true', () => {
    const { container } = render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={true}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that the container has the selected class
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('bg-muted');
    expect(containerDiv).toHaveClass('border-l-2');
    expect(containerDiv).toHaveClass('border-l-primary');
  });

  it('applies correct styling when isDragging is true', () => {
    const { container } = render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        isDragging={true}
        onToggle={mockOnToggle}
      />
    );

    // Check that the container has the dragging class
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('bg-accent');
  });

  it('applies correct styling when isPermanentManuscript is true', () => {
    const { container } = render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={true}
        onToggle={mockOnToggle}
      />
    );

    // Check that the container has the permanent manuscript class
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('border-l-2');
    expect(containerDiv).toHaveClass('border-l-blue-500');
  });

  it('applies correct padding based on level prop', () => {
    const level = 3;
    const expectedPadding = `${level * 16 + 8}px`;
    
    const { container } = render(
      <BinderItemContent
        node={mockNode}
        level={level}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that the container has the correct padding-left style
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.style.paddingLeft).toBe(expectedPadding);
  });

  it('passes correct props to DragHandle component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={true}
        onToggle={mockOnToggle}
      />
    );

    // Check that DragHandle was called with the correct props
    expect(DragHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        dragHandleProps: mockDragHandleProps,
        isPermanent: true
      }),
      expect.anything()
    );
  });

  it('passes correct props to ExpandCollapseButton component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={true}
        hasChildren={true}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that ExpandCollapseButton was called with the correct props
    expect(ExpandCollapseButton).toHaveBeenCalledWith(
      expect.objectContaining({
        isExpanded: true,
        hasChildren: true,
        onToggle: mockOnToggle
      }),
      expect.anything()
    );
  });

  it('passes correct props to TypeIcon component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that TypeIcon was called with the correct props
    expect(TypeIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        type: mockNode.type
      }),
      expect.anything()
    );
  });

  it('passes correct props to ItemTitle component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        isEditing={true}
        onToggle={mockOnToggle}
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );

    // Check that ItemTitle was called with the correct props
    expect(ItemTitle).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockNode.title,
        isEditing: true,
        onTitleChange: mockOnTitleChange,
        onEditComplete: mockOnEditComplete
      }),
      expect.anything()
    );
  });

  it('passes correct props to StatusIndicator component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that StatusIndicator was called with the correct props
    expect(StatusIndicator).toHaveBeenCalledWith(
      expect.objectContaining({
        status: mockNode.status
      }),
      expect.anything()
    );
  });

  it('passes correct props to WordCount component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
      />
    );

    // Check that WordCount was called with the correct props
    expect(WordCount).toHaveBeenCalledWith(
      expect.objectContaining({
        wordCount: mockNode.wordCount
      }),
      expect.anything()
    );
  });

  it('passes correct props to ItemActions component', () => {
    render(
      <BinderItemContent
        node={mockNode}
        level={1}
        isSelected={false}
        isExpanded={false}
        hasChildren={false}
        dragHandleProps={mockDragHandleProps}
        isPermanentManuscript={false}
        onToggle={mockOnToggle}
        onStartEditing={mockOnStartEditing}
      />
    );

    // Check that ItemActions was called with the correct props
    expect(ItemActions).toHaveBeenCalledWith(
      expect.objectContaining({
        node: mockNode,
        onStartEditing: mockOnStartEditing
      }),
      expect.anything()
    );
  });
});