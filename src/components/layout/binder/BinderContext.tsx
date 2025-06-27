import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DocumentNode } from '@/types/document';

// Define types for the context
interface DragState {
  isDragging: boolean;
  draggedNodeId?: string;
  dragOverNodeId?: string;
  dragPosition?: 'before' | 'after' | 'inside';
}

interface FilterCriteria {
  searchQuery: string;
  statusFilter: string;
}

interface BinderContextType {
  // State
  expandedNodes: Set<string>;
  selectedId?: string;
  dragState: DragState;
  filterCriteria: FilterCriteria;
  
  // Actions
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: DocumentNode) => void;
  setFilterCriteria: (criteria: Partial<FilterCriteria>) => void;
  
  // Drag operations
  setDragState: (dragState: Partial<DragState>) => void;
  resetDragState: () => void;
}

// Create the context with a default value
const BinderContext = createContext<BinderContextType | undefined>(undefined);

// Props for the provider component
interface BinderProviderProps {
  children: React.ReactNode;
  initialExpandedNodes?: Set<string>;
  initialSelectedNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeAdd?: (parentId: string) => void;
  onNodeEdit?: (node: DocumentNode) => void;
}

/**
 * Provider component for the Binder context
 */
export const BinderProvider: React.FC<BinderProviderProps> = ({
  children,
  initialExpandedNodes = new Set<string>(),
  initialSelectedNodeId,
  onNodeSelect,
  onNodeDelete,
  onNodeAdd,
  onNodeEdit,
}) => {
  // State management
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(initialExpandedNodes);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedNodeId);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    searchQuery: '',
    statusFilter: 'all',
  });

  // Toggle node expansion
  const onToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prevExpandedNodes) => {
      const newExpandedNodes = new Set(prevExpandedNodes);
      if (newExpandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
      } else {
        newExpandedNodes.add(nodeId);
      }
      return newExpandedNodes;
    });
  }, []);

  // Select a node
  const onSelect = useCallback((nodeId: string) => {
    setSelectedId(nodeId);
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  }, [onNodeSelect]);

  // Delete a node
  const onDelete = useCallback((nodeId: string) => {
    if (onNodeDelete) {
      onNodeDelete(nodeId);
    }
  }, [onNodeDelete]);

  // Add a child node
  const onAddChild = useCallback((parentId: string) => {
    if (onNodeAdd) {
      onNodeAdd(parentId);
    }
  }, [onNodeAdd]);

  // Edit a node
  const onEdit = useCallback((node: DocumentNode) => {
    if (onNodeEdit) {
      onNodeEdit(node);
    }
  }, [onNodeEdit]);

  // Update filter criteria
  const updateFilterCriteria = useCallback((criteria: Partial<FilterCriteria>) => {
    setFilterCriteria(prevCriteria => ({
      ...prevCriteria,
      ...criteria
    }));
  }, []);

  // Reset drag state
  const resetDragState = useCallback(() => {
    setDragState({ isDragging: false });
  }, []);

  // Update drag state
  const updateDragState = useCallback((newDragState: Partial<DragState>) => {
    setDragState(prevState => ({
      ...prevState,
      ...newDragState
    }));
  }, []);

  // Context value
  const contextValue: BinderContextType = {
    // State
    expandedNodes,
    selectedId,
    dragState,
    filterCriteria,
    
    // Actions
    onToggle,
    onSelect,
    onDelete,
    onAddChild,
    onEdit,
    setFilterCriteria: updateFilterCriteria,
    
    // Drag operations
    setDragState: updateDragState,
    resetDragState,
  };

  return (
    <BinderContext.Provider value={contextValue}>
      {children}
    </BinderContext.Provider>
  );
};

/**
 * Hook to use the binder context
 * @throws {Error} If used outside of a BinderProvider
 */
export const useBinderContext = (): BinderContextType => {
  const context = useContext(BinderContext);
  if (context === undefined) {
    throw new Error('useBinderContext must be used within a BinderProvider');
  }
  return context;
};

export default BinderContext;