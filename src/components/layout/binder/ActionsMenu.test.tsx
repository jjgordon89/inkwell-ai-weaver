import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionsMenu from './ActionsMenu';
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';

// Mock the BinderContext hook
vi.mock('./BinderContext', () => ({
  useBinderContext: vi.fn(),
}));

describe('ActionsMenu', () => {
  // Mock functions
  const mockOnDelete = vi.fn();
  const mockOnAddChild = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnRename = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for useBinderContext
      (useBinderContext as jest.Mock).mockReturnValue({
      onDelete: mockOnDelete,
      onAddChild: mockOnAddChild,
      onEdit: mockOnEdit,
    });
  });

  // Mock document nodes for different test scenarios
  const folderNode: DocumentNode = {
    id: 'folder-1',
    title: 'Test Folder',
    type: 'folder',
    status: 'not-started',
    wordCount: 0,
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 0,
  };

  const documentNode: DocumentNode = {
    id: 'doc-1',
    title: 'Test Document',
    type: 'document',
    status: 'draft',
    wordCount: 1000,
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 1,
  };

  const permanentManuscriptNode: DocumentNode = {
    id: 'manuscript-root',
    title: 'Manuscript',
    type: 'folder',
    status: 'not-started',
    wordCount: 0,
    labels: ['permanent'],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 0,
  };

  const chapterNode: DocumentNode = {
    id: 'chapter-1',
    title: 'Chapter 1',
    type: 'chapter',
    status: 'draft',
    wordCount: 2000,
    labels: [],
    createdAt: new Date(),
    lastModified: new Date(),
    position: 0,
  };

  // Helper function to open the dropdown menu
  const openDropdownMenu = () => {
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
  };

  it('renders the dropdown menu', () => {
    render(<ActionsMenu node={folderNode} />);
    
    // Check that the trigger button is rendered
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toBeInTheDocument();
    
    // Open the dropdown menu
    openDropdownMenu();
    
    // Check that the menu items are rendered
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Add Child')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows "Add Child" menu item when canHaveChildren is true (folder type)', () => {
    render(<ActionsMenu node={folderNode} />);
    openDropdownMenu();
    
    // Check that the "Add Child" menu item is rendered
    expect(screen.getByText('Add Child')).toBeInTheDocument();
  });

  it('shows "Add Child" menu item when canHaveChildren is true (chapter type)', () => {
    render(<ActionsMenu node={chapterNode} />);
    openDropdownMenu();
    
    // Check that the "Add Child" menu item is rendered
    expect(screen.getByText('Add Child')).toBeInTheDocument();
  });

  it('does not show "Add Child" menu item when canHaveChildren is false', () => {
    render(<ActionsMenu node={documentNode} />);
    openDropdownMenu();
    
    // Check that the "Add Child" menu item is not rendered
    expect(screen.queryByText('Add Child')).not.toBeInTheDocument();
  });

  it('shows "Delete" menu item when isPermanentManuscript is false', () => {
    render(<ActionsMenu node={folderNode} />);
    openDropdownMenu();
    
    // Check that the "Delete" menu item is rendered
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show "Delete" menu item when isPermanentManuscript is true', () => {
    render(<ActionsMenu node={permanentManuscriptNode} />);
    openDropdownMenu();
    
    // Check that the "Delete" menu item is not rendered
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls onRename when provided and "Rename" menu item is clicked', () => {
    render(<ActionsMenu node={folderNode} onRename={mockOnRename} />);
    openDropdownMenu();
    
    // Click the "Rename" menu item
    fireEvent.click(screen.getByText('Rename'));
    
    // Check that onRename was called
    expect(mockOnRename).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('calls onEdit when onRename is not provided and "Rename" menu item is clicked', () => {
    render(<ActionsMenu node={folderNode} />);
    openDropdownMenu();
    
    // Click the "Rename" menu item
    fireEvent.click(screen.getByText('Rename'));
    
    // Check that onEdit was called with the node
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(folderNode);
  });

  it('calls onAddChild with the node id when "Add Child" menu item is clicked', () => {
    render(<ActionsMenu node={folderNode} />);
    openDropdownMenu();
    
    // Click the "Add Child" menu item
    fireEvent.click(screen.getByText('Add Child'));
    
    // Check that onAddChild was called with the node id
    expect(mockOnAddChild).toHaveBeenCalledTimes(1);
    expect(mockOnAddChild).toHaveBeenCalledWith(folderNode.id);
  });

  it('calls onDelete with the node id when "Delete" menu item is clicked', () => {
    render(<ActionsMenu node={folderNode} />);
    openDropdownMenu();
    
    // Click the "Delete" menu item
    fireEvent.click(screen.getByText('Delete'));
    
    // Check that onDelete was called with the node id
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(folderNode.id);
  });
});