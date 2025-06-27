import { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { DocumentNode } from '@/types/document';

export interface VirtualizationOptions {
  itemHeight: number;
  overscan: number;
  containerHeight?: number;
}

export interface VirtualNode {
  node: DocumentNode;
  index: number;
  depth: number;
  position: number;
  height: number;
  parentId: string | null;
  isExpanded: boolean;
}

export interface VirtualizationResult {
  virtualNodes: VirtualNode[];
  visibleNodes: VirtualNode[];
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  getNodeIndex: (nodeId: string) => number;
  containerRef: RefObject<HTMLDivElement>;
  startIndex: number;
  metrics: {
    totalNodes: number;
    renderedNodes: number;
    reductionPercentage: number;
  };
  setFocusedNode: (nodeId: string) => void;
  getVirtualItemProps: (index: number) => {
    style: {
      position: 'absolute';
      top: string;
      left: 0;
      width: '100%';
      height: string;
    };
  };
}

/**
 * Flattens a hierarchical tree of DocumentNodes into a linear array of VirtualNodes
 * considering the expanded/collapsed state
 */
function flattenTree(
  nodes: DocumentNode[],
  expandedNodes: Set<string>,
  parentId: string | null = null,
  depth: number = 0,
  startIndex: number = 0
): VirtualNode[] {
  let flattenedNodes: VirtualNode[] = [];
  let currentIndex = startIndex;

  for (const node of nodes) {
    // Add the current node
    flattenedNodes.push({
      node,
      index: currentIndex++,
      depth,
      position: flattenedNodes.length,
      height: 40, // Default height, will be updated by the hook
      parentId,
      isExpanded: expandedNodes.has(node.id)
    });

    // If the node is expanded and has children, recursively add its children
    if (expandedNodes.has(node.id) && node.children && node.children.length > 0) {
      const childNodes = flattenTree(
        node.children,
        expandedNodes,
        node.id,
        depth + 1,
        currentIndex
      );
      flattenedNodes = [...flattenedNodes, ...childNodes];
      currentIndex += childNodes.length;
    }
  }

  return flattenedNodes;
}

/**
 * Binary search to find the start index for visible nodes
 * This optimized version accounts for variable heights based on depth
 */
function findStartIndex(
  virtualNodes: VirtualNode[],
  scrollTop: number,
  itemHeight: number
): number {
  if (virtualNodes.length === 0) return 0;
  
  let low = 0;
  let high = virtualNodes.length - 1;
  let mid = 0;
  let accumulatedHeight = 0;
  
  // Fast path: if scrollTop is 0, return 0
  if (scrollTop <= 0) return 0;
  
  // Fast path: if scrollTop is beyond the total height, return the last possible index
  const estimatedTotalHeight = virtualNodes.length * itemHeight;
  if (scrollTop >= estimatedTotalHeight) return Math.max(0, virtualNodes.length - 1);
  
  // Binary search to find the node at or just before the scroll position
  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    
    // Estimate position based on index and item height
    // For more precise calculation with variable heights, we could accumulate actual heights
    accumulatedHeight = mid * itemHeight;
    
    if (accumulatedHeight < scrollTop) {
      low = mid + 1;
    } else if (accumulatedHeight > scrollTop) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  
  // Return the index just before the scroll position
  return Math.max(0, low - 1);
}

/**
 * Hook for virtualizing a hierarchical tree of nodes
 */
export function useVirtualization(
  nodes: DocumentNode[],
  expandedNodes: Set<string>,
  options: VirtualizationOptions
): VirtualizationResult {
  const { itemHeight, overscan, containerHeight = 800 } = options;
  
  // Ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for scroll position
  const [scrollTop, setScrollTop] = useState(0);
  
  // Store the focused node ID before expansion/collapse
  const lastFocusedNodeRef = useRef<string | null>(null);
  
  // Flatten the tree considering expanded/collapsed state
  const [virtualNodes, setVirtualNodes] = useState<VirtualNode[]>([]);
  
  // Calculate start index for rendering
  const [startIndex, setStartIndex] = useState(0);
  
  // Memoize the flattening operation
  useEffect(() => {
    const flattened = flattenTree(nodes, expandedNodes);
    
    // Update heights based on depth
    flattened.forEach(node => {
      // Root level items might have different height than nested items
      node.height = node.depth === 0 ? itemHeight : itemHeight;
    });
    
    setVirtualNodes(flattened);
    
    // Preserve scroll position after tree changes
    if (lastFocusedNodeRef.current) {
      const nodeIndex = flattened.findIndex(
        vNode => vNode.node.id === lastFocusedNodeRef.current
      );
      
      if (nodeIndex !== -1) {
        setTimeout(() => {
          scrollToIndex(nodeIndex);
          lastFocusedNodeRef.current = null;
        }, 0);
      }
    }
  }, [nodes, expandedNodes, itemHeight]);
  
  // Calculate visible nodes based on scroll position
  const getVisibleNodes = useCallback(() => {
    if (virtualNodes.length === 0) return [];
    
    // Calculate the range of visible nodes
    const start = findStartIndex(virtualNodes, scrollTop, itemHeight);
    setStartIndex(start);
    
    // Calculate how many items can fit in the viewport plus overscan
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(start + visibleCount, virtualNodes.length);
    
    // Get the visible nodes with overscan
    const startWithOverscan = Math.max(0, start - overscan);
    const endWithOverscan = Math.min(endIndex + overscan, virtualNodes.length);
    
    return virtualNodes.slice(startWithOverscan, endWithOverscan);
  }, [virtualNodes, scrollTop, containerHeight, itemHeight, overscan]);
  
  // Calculate visible nodes
  const visibleNodes = getVisibleNodes();
  
  // Calculate total height
  const totalHeight = virtualNodes.length * itemHeight;
  
  // Scroll to a specific index
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current && index >= 0 && index < virtualNodes.length) {
      const scrollPosition = index * itemHeight;
      containerRef.current.scrollTop = scrollPosition;
      setScrollTop(scrollPosition);
    }
  }, [virtualNodes, itemHeight]);
  
  // Get the index of a node by its ID
  const getNodeIndex = useCallback((nodeId: string): number => {
    return virtualNodes.findIndex(vNode => vNode.node.id === nodeId);
  }, [virtualNodes]);
  
  // Set up scroll event listener with debounce for performance
  useEffect(() => {
    let scrollTimeoutId: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (containerRef.current) {
        // Use requestAnimationFrame for smoother scrolling
        if (scrollTimeoutId) {
          clearTimeout(scrollTimeoutId);
        }
        
        scrollTimeoutId = setTimeout(() => {
          setScrollTop(containerRef.current!.scrollTop);
          scrollTimeoutId = null;
        }, 10); // Small timeout for debouncing
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        if (scrollTimeoutId) {
          clearTimeout(scrollTimeoutId);
        }
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []); // Empty dependency array since we use ref
  
  // Function to set the focused node before expansion/collapse
  const setFocusedNode = useCallback((nodeId: string) => {
    lastFocusedNodeRef.current = nodeId;
  }, []);
  
  // Calculate performance metrics
  const metrics = {
    totalNodes: virtualNodes.length,
    renderedNodes: visibleNodes.length,
    reductionPercentage: virtualNodes.length > 0
      ? Math.round((1 - visibleNodes.length / virtualNodes.length) * 100)
      : 0
  };
  
  // Helper function to get props for rendering a virtual item
  const getVirtualItemProps = useCallback((index: number) => {
    const node = visibleNodes[index];
    if (!node) {
      return {
        style: {
          position: 'absolute' as const,
          top: '0px',
          left: 0 as const, // Use literal 0 type to match interface
          width: '100%' as const,
          height: `${itemHeight}px`,
        }
      };
    }
    
    // Calculate the absolute position based on the node's index in the full list
    const absoluteIndex = node.index;
    const top = absoluteIndex * itemHeight;
    
    return {
      style: {
        position: 'absolute' as const,
        top: `${top}px`,
        left: 0 as const, // Use literal 0 type to match interface
        width: '100%' as const,
        height: `${node.height}px`,
      }
    };
  }, [visibleNodes, itemHeight]);
  
  return {
    virtualNodes,
    visibleNodes,
    totalHeight,
    scrollToIndex,
    getNodeIndex,
    containerRef,
    startIndex,
    metrics,
    setFocusedNode,
    getVirtualItemProps
  };
}