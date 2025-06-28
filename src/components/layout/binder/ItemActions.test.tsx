import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemActions from './ItemActions';
import ActionsMenu from './ActionsMenu';
import type { DocumentNode } from '@/types/document';

// Mock the ActionsMenu component
vi.mock('./ActionsMenu', () => ({
  default: vi.fn(() => <div data-testid="actions-menu" />)
}));

describe('ItemActions', () => {
  // Mock document node for testing
  const mockNode: DocumentNode = {
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

  // Mock function for onStartEditing
  const mockOnStartEditing = vi.fn();

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    (ActionsMenu as jest.Mock).mockClear();
  });

  it('should render the ActionsMenu component', () => {
    render(<ItemActions node={mockNode} />);
    
    // Check that ActionsMenu is rendered
    expect(screen.getByTestId('actions-menu')).toBeInTheDocument();
  });

  it('should pass the correct props to ActionsMenu', () => {
    render(<ItemActions node={mockNode} onStartEditing={mockOnStartEditing} />);
    
    // Check that ActionsMenu was called with the correct props
    expect(ActionsMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        node: mockNode,
        onRename: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('should update isMenuOpen state on mouse enter/leave events', () => {
    render(<ItemActions node={mockNode} />);
    
    // Get the container div
    const containerDiv = screen.getByTestId('actions-menu').parentElement;
    expect(containerDiv).toBeInTheDocument();
    
    // Initially, ActionsMenu is called with default props
    expect(ActionsMenu).toHaveBeenCalledTimes(1);
    
    // Simulate mouse enter
    fireEvent.mouseEnter(containerDiv!);
    
    // Re-render should happen with updated state
    // We can't directly test state, but we can verify the component was re-rendered
    expect(ActionsMenu).toHaveBeenCalledTimes(2);
    
    // Simulate mouse leave
    fireEvent.mouseLeave(containerDiv!);
    
    // Another re-render should happen
    expect(ActionsMenu).toHaveBeenCalledTimes(3);
  });

  it('should call onStartEditing when handleRename is called', () => {
    render(<ItemActions node={mockNode} onStartEditing={mockOnStartEditing} />);
    
    // Extract the onRename function passed to ActionsMenu
    const onRenameFunction = (ActionsMenu as jest.Mock).mock.calls[0][0].onRename;
    
    // Call the onRename function directly
    onRenameFunction();
    
    // Check that onStartEditing was called
    expect(mockOnStartEditing).toHaveBeenCalledTimes(1);
  });

  it('should not error when onStartEditing is not provided', () => {
    render(<ItemActions node={mockNode} />);
    
    // Extract the onRename function passed to ActionsMenu
    const onRenameFunction = (ActionsMenu as jest.Mock).mock.calls[0][0].onRename;
    
    // This should not throw an error
    expect(() => onRenameFunction()).not.toThrow();
  });

  it('should set isMenuOpen to false when handleRename is called', () => {
    render(<ItemActions node={mockNode} />);
    
    // Get the container div
    const containerDiv = screen.getByTestId('actions-menu').parentElement;
    
    // First set isMenuOpen to true with mouse enter
    fireEvent.mouseEnter(containerDiv!);
    
    // Reset the mock to track new calls
    (ActionsMenu as jest.Mock).mockClear();
    
    // Extract and call the onRename function
    const onRenameFunction = (ActionsMenu as jest.Mock).mock.calls[0][0].onRename;
    onRenameFunction();
    
    // Component should re-render with isMenuOpen set to false
    expect(ActionsMenu).toHaveBeenCalledTimes(1);
    
    // Verify the state was reset by checking that mouse enter causes a re-render
    fireEvent.mouseEnter(containerDiv!);
    expect(ActionsMenu).toHaveBeenCalledTimes(2);
  });
});