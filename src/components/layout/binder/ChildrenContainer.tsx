import React from 'react';
import { BinderItemList } from './BinderItemList';
import type { DocumentNode } from '@/types/document';

interface ChildrenContainerProps {
  nodeId: string;
  children: DocumentNode[];
  level: number;
}

export const ChildrenContainer: React.FC<ChildrenContainerProps> = React.memo(({
  nodeId,
  children,
  level
}) => {
  return (
    <BinderItemList
      nodes={children}
      level={level + 1}
      parentId={nodeId}
    />
  );
});

ChildrenContainer.displayName = 'ChildrenContainer';