
import React, { useState } from 'react';
import ActionsMenu from './ActionsMenu';
import type { DocumentNode } from '@/types/document';

interface ItemActionsProps {
  node: DocumentNode;
  onStartEditing?: () => void;
}

const ItemActions: React.FC<ItemActionsProps> = ({ node, onStartEditing }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRename = () => {
    if (onStartEditing) {
      onStartEditing();
    }
    setIsMenuOpen(false);
  };

  return (
    <div
      className="opacity-0 group-hover:opacity-100 transition-opacity"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <ActionsMenu
        node={node}
        onRename={handleRename}
      />
    </div>
  );
};

export default ItemActions;
