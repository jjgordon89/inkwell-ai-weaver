import { useState, useEffect, useCallback } from 'react';
import type { DocumentNode } from '@/types/document';

interface UseVirtualizationOptions {
  nodes: DocumentNode[];
  expandedNodes: Set<string>;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface UseVirtualizationResult {
  visibleNodes: DocumentNode[];
  totalHeight: number;
  startOffset: number;
}

export const useVirtualization = ({
  nodes,
  expandedNodes,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualizationOptions): UseVirtualizationResult => {
  // Calculate the total number of visible nodes (including expanded children)
  const calculateVisibleNodes = useCallback((nodes: DocumentNode[], expanded: Set<string>): number => {
    let count = nodes.length;

    for (const node of nodes) {
      if (node.children && node.children.length > 0 && expanded.has(node.id)) {
        count += calculateVisibleNodes(node.children, expanded);
      }
    }

    return count;
  }, []);

  // Flatten the tree into a list of visible nodes
  const flattenTree = useCallback((nodes: DocumentNode[], expanded: Set<string>): DocumentNode[] => {
    const result: DocumentNode[] = [];

    for (const node of nodes) {
      result.push(node);

      if (node.children && node.children.length > 0 && expanded.has(node.id)) {
        result.push(...flattenTree(node.children, expanded));
      }
    }

    return result;
  }, []);

  const [visibleNodes, setVisibleNodes] = useState<DocumentNode[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);
  const [startOffset, setStartOffset] = useState(0);

  useEffect(() => {
    const totalNodes = calculateVisibleNodes(nodes, expandedNodes);
    setTotalHeight(totalNodes * itemHeight);

    const flattenedNodes = flattenTree(nodes, expandedNodes);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const startIndex = Math.max(0, Math.floor(window.scrollY / itemHeight) - overscan);
    const endIndex = Math.min(flattenedNodes.length, startIndex + visibleCount);

    setStartOffset(startIndex * itemHeight);
    setVisibleNodes(flattenedNodes.slice(startIndex, endIndex));
  }, [nodes, expandedNodes, itemHeight, containerHeight, overscan, calculateVisibleNodes, flattenTree]);

  return { visibleNodes, totalHeight, startOffset };
};