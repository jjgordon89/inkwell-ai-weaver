
import React, { useMemo } from 'react';
import { useBinderContext } from './BinderContext';
import BinderItemList from './BinderItemList';
import type { DocumentNode } from '@/types/document';

interface BinderTreeProps {
  nodes: DocumentNode[];
  useVirtualization?: boolean;
  virtualizationOptions?: {
    itemHeight: number;
    overscan: number;
    containerHeight?: number;
  };
}

/**
 * BinderTree component that renders a hierarchical tree of document nodes
 * Uses BinderContext for state management and delegates rendering to BinderItemList
 */
const BinderTree: React.FC<BinderTreeProps> = ({
  nodes,
  useVirtualization = true,
  virtualizationOptions = { itemHeight: 40, overscan: 5 }
}) => {
  // Get state and actions from context
  const {
    expandedNodes,
    selectedId,
    filterCriteria,
    onToggle,
    onSelect,
    onDelete,
    onAddChild,
    onEdit,
    setFilterCriteria
  } = useBinderContext();

  // Extract filter criteria
  const { searchQuery, statusFilter } = filterCriteria;

  // Clear filters handler
  const handleClearFilters = () => {
    setFilterCriteria({
      searchQuery: '',
      statusFilter: 'all'
    });
  };

  // Memoize the filtered tree to prevent unnecessary re-renders
  const filteredTree = useMemo(() => {
    // If no filters are applied, return the original tree
    if (!searchQuery && statusFilter === 'all') {
      return nodes;
    }

    // Helper function to filter nodes recursively
    const filterNodes = (nodes: DocumentNode[]): DocumentNode[] => {
      return nodes
        .filter(node => {
          // Check if the node matches the search query
          const matchesSearch = !searchQuery ||
            node.title.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Check if the node matches the status filter
          const matchesStatus = statusFilter === 'all' ||
            node.status === statusFilter;
          
          // Check if any children match the filters
          const hasMatchingChildren = node.children &&
            filterNodes(node.children).length > 0;
          
          // Include the node if it matches the filters or has matching children
          return (matchesSearch && matchesStatus) || hasMatchingChildren;
        })
        .map(node => {
          // If the node has children, filter them recursively
          if (node.children) {
            return {
              ...node,
              children: filterNodes(node.children)
            };
          }
          return node;
        });
    };

    return filterNodes(nodes);
  }, [nodes, searchQuery, statusFilter]);

  // Delegate rendering to BinderItemList
  return (
    <BinderItemList
      filteredTree={filteredTree}
      expandedNodes={expandedNodes}
      selectedId={selectedId}
      onSelect={(node) => onSelect(node.id)}
      onToggle={onToggle}
      onDelete={onDelete}
      onAddChild={onAddChild}
      onEdit={onEdit}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onClearFilters={handleClearFilters}
      useVirtualization={useVirtualization}
      virtualizationOptions={virtualizationOptions}
    />
  );
};

export default BinderTree;
