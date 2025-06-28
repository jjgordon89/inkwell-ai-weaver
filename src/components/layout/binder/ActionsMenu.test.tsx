
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionsMenu from './ActionsMenu';
import type { DocumentNode } from '@/types/document';

describe('ActionsMenu', () => {
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

  const mockOnRename = vi.fn();
  const mockOnDuplicate = vi.fn();
  const mockOnAddChild = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ActionsMenu 
        node={mockNode}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onAddChild={mockOnAddChild}
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Add more tests as needed
});
