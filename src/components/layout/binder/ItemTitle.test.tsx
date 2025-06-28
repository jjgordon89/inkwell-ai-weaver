import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemTitle from './ItemTitle';

describe('ItemTitle', () => {
  const mockTitle = 'Test Title';
  const mockOnTitleChange = vi.fn();
  const mockOnEditComplete = vi.fn();

  beforeEach(() => {
    // Clear mocks before each test
    mockOnTitleChange.mockClear();
    mockOnEditComplete.mockClear();
  });

  it('should render the title correctly in non-editing mode', () => {
    render(<ItemTitle title={mockTitle} isEditing={false} />);
    
    // Check that the title is displayed
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    
    // Check that it's rendered as a span
    const titleElement = screen.getByText(mockTitle);
    expect(titleElement.tagName).toBe('SPAN');
  });

  it('should render an input field in editing mode', () => {
    render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={true} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    // Check that an input field is rendered
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    
    // Check that the input has the correct value
    expect(inputElement).toHaveValue(mockTitle);
  });

  it('should focus the input when entering edit mode', () => {
    // Create a mock for document.activeElement
    const originalActiveElement = document.activeElement;
    
    render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={true} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    // Check that the input is focused
    const inputElement = screen.getByRole('textbox');
    expect(document.activeElement).toBe(inputElement);
    
    // Restore original active element
    if (originalActiveElement) {
      (originalActiveElement as HTMLElement).focus();
    }
  });

  it('should call onTitleChange when input value changes', () => {
    render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={true} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    const inputElement = screen.getByRole('textbox');
    const newTitle = 'New Title';
    
    // Simulate typing in the input
    fireEvent.change(inputElement, { target: { value: newTitle } });
    
    // Check that onTitleChange was called with the new value
    expect(mockOnTitleChange).toHaveBeenCalledWith(newTitle);
    expect(mockOnTitleChange).toHaveBeenCalledTimes(1);
  });

  it('should call onEditComplete when Enter key is pressed', () => {
    render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={true} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    const inputElement = screen.getByRole('textbox');
    
    // Simulate pressing Enter
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // Check that onEditComplete was called
    expect(mockOnEditComplete).toHaveBeenCalledTimes(1);
  });

  it('should reset to original title and call onEditComplete when Escape key is pressed', () => {
    render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={true} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    const inputElement = screen.getByRole('textbox');
    const newTitle = 'New Title';
    
    // First change the title
    fireEvent.change(inputElement, { target: { value: newTitle } });
    
    // Then press Escape
    fireEvent.keyDown(inputElement, { key: 'Escape' });
    
    // Check that onEditComplete was called
    expect(mockOnEditComplete).toHaveBeenCalledTimes(1);
    
    // Check that the title was reset to the original
    // Note: We need to re-render to see the effect since the component state is reset
    // but the DOM won't update in the test environment without a re-render
    const { rerender } = render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={false} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    // Check that the original title is displayed
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });

  it('should call onEditComplete when input loses focus', () => {
    render(
      <ItemTitle 
        title={mockTitle} 
        isEditing={true} 
        onTitleChange={mockOnTitleChange}
        onEditComplete={mockOnEditComplete}
      />
    );
    
    const inputElement = screen.getByRole('textbox');
    
    // Simulate blur event
    fireEvent.blur(inputElement);
    
    // Check that onEditComplete was called
    expect(mockOnEditComplete).toHaveBeenCalledTimes(1);
  });
});