import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';

interface ExpandCollapseButtonProps {
  node: DocumentNode;
  hasChildren: boolean;
}

export const ExpandCollapseButton: React.FC<ExpandCollapseButtonProps> = React.memo(({
  node,
  hasChildren
}) => {
  const { expandedNodes, onToggle } = useBinderContext();
  const isExpanded = expandedNodes.has(node.id);

  if (!hasChildren) {
    return <div className="w-4" />;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(node.id);
      }}
      className="p-0 h-4 w-4 flex items-center justify-center hover:bg-accent rounded"
    >
      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
    </button>
  );
});

ExpandCollapseButton.displayName = 'ExpandCollapseButton';