
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ItemTitle from './ItemTitle';
import type { DocumentNode } from '@/types/document';

const mockNode: DocumentNode = {
  id: '1',
  title: 'Test Document',
  type: 'document',
  status: 'not-started',
  wordCount: 0,
  labels: [],
  createdAt: new Date(),
  lastModified: new Date(),
  position: 0
};

describe('ItemTitle', () => {
  it('renders title correctly when not editing', () => {
    const { getByText } = render(
      <ItemTitle node={mockNode} isEditing={false} />
    );
    
    expect(getByText('Test Document')).toBeInTheDocument();
  });

  it('renders input when editing', () => {
    const { getByDisplayValue } = render(
      <ItemTitle 
        node={mockNode} 
        isEditing={true} 
        onTitleChange={vi.fn()} 
        onEditComplete={vi.fn()} 
      />
    );
    
    expect(getByDisplayValue('Test Document')).toBeInTheDocument();
  });

  it('calls onTitleChange when title is modified and submitted', () => {
    const onTitleChange = vi.fn();
    const onEditComplete = vi.fn();
    
    const { getByDisplayValue } = render(
      <ItemTitle 
        node={mockNode} 
        isEditing={true} 
        onTitleChange={onTitleChange} 
        onEditComplete={onEditComplete} 
      />
    );
    
    const input = getByDisplayValue('Test Document');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onTitleChange).toHaveBeenCalledWith('New Title');
    expect(onEditComplete).toHaveBeenCalled();
  });

  it('handles escape key to cancel editing', () => {
    const onTitleChange = vi.fn();
    const onEditComplete = vi.fn();
    
    const { getByDisplayValue } = render(
      <ItemTitle 
        node={mockNode} 
        isEditing={true} 
        onTitleChange={onTitleChange} 
        onEditComplete={onEditComplete} 
      />
    );
    
    const input = getByDisplayValue('Test Document');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(onTitleChange).not.toHaveBeenCalled();
    expect(onEditComplete).toHaveBeenCalled();
  });

  it('calls onEditComplete on blur', () => {
    const onTitleChange = vi.fn();
    const onEditComplete = vi.fn();
    
    const { getByDisplayValue } = render(
      <ItemTitle 
        node={mockNode} 
        isEditing={true} 
        onTitleChange={onTitleChange} 
        onEditComplete={onEditComplete} 
      />
    );
    
    const input = getByDisplayValue('Test Document');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.blur(input);
    
    expect(onTitleChange).toHaveBeenCalledWith('New Title');
    expect(onEditComplete).toHaveBeenCalled();
  });

  it('does not call onTitleChange when title is unchanged', () => {
    const onTitleChange = vi.fn();
    const onEditComplete = vi.fn();
    
    const { getByDisplayValue } = render(
      <ItemTitle 
        node={mockNode} 
        isEditing={true} 
        onTitleChange={onTitleChange} 
        onEditComplete={onEditComplete} 
      />
    );
    
    const input = getByDisplayValue('Test Document');
    fireEvent.blur(input);
    
    expect(onTitleChange).not.toHaveBeenCalled();
    expect(onEditComplete).toHaveBeenCalled();
  });

  it('trims whitespace from title', () => {
    const onTitleChange = vi.fn();
    const onEditComplete = vi.fn();
    
    const { getByDisplayValue } = render(
      <ItemTitle 
        node={mockNode} 
        isEditing={true} 
        onTitleChange={onTitleChange} 
        onEditComplete={onEditComplete} 
      />
    );
    
    const input = getByDisplayValue('Test Document');
    fireEvent.change(input, { target: { value: '  New Title  ' } });
    fireEvent.blur(input);
    
    expect(onTitleChange).toHaveBeenCalledWith('New Title');
  });

  it('displays title as span when not editing', () => {
    const { container } = render(
      <ItemTitle node={mockNode} isEditing={false} />
    );
    
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveClass('text-sm', 'font-medium', 'truncate');
  });
});
