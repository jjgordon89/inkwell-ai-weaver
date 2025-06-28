import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BinderItemContent from './BinderItemContent';
import type { DocumentNode } from '@/types/document';

// Mock the child components
vi.mock('./TypeIcon', () => ({
  default: vi.fn(() => <div data-testid="type-icon" />)
}));

vi.mock('./ItemTitle', () => ({
  default: vi.fn(() => <div data-testid="item-title" />)
}));

vi.mock('./StatusIndicator', () => ({
  default: vi.fn(() => <div data-testid="status-indicator" />)
}));

vi.mock('./WordCount', () => ({
  default: vi.fn(() => <div data-testid="word-count" />)
}));

vi.mock('./ItemActions', () => ({
  default: vi.fn(() => <div data-testid="item-actions" />)
}));

vi.mock('./ExpandCollapseButton', () => ({
  default: vi.fn(() => <div data-testid="expand-collapse-button" />)
}));

vi.mock('./DragHandle', () => ({
  default: vi.fn(() => <div data-testid="drag-handle" />)
}));

describe('BinderItemContent', () => {
  const mockNode: DocumentNode = {
    id: 'test-id',
    title: 'Test Document',
    type: 'document',
    status: 'draft',
    wordCount: 100,
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 0
  };

  const mockProps = {
    node: mockNode,
    isSelected: false,
    isExpanded: false,
    hasChildren: false,
    onSelect: vi.fn(),
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onAddChild: vi.fn(),
    onEdit: vi.fn(),
    onStartEditing: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all child components', () => {
    render(<BinderItemContent {...mockProps} />);
    
    expect(screen.getByTestId('type-icon')).toBeInTheDocument();
    expect(screen.getByTestId('item-title')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('word-count')).toBeInTheDocument();
    expect(screen.getByTestId('item-actions')).toBeInTheDocument();
    expect(screen.getByTestId('expand-collapse-button')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });
});
