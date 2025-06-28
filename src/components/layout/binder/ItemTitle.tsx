
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import type { DocumentNode } from '@/types/document';

interface ItemTitleProps {
  node: DocumentNode;
  isEditing?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onEditComplete?: () => void;
}

const ItemTitle: React.FC<ItemTitleProps> = ({
  node,
  isEditing = false,
  onTitleChange,
  onEditComplete
}) => {
  const [title, setTitle] = useState(node.title);

  useEffect(() => {
    setTitle(node.title);
  }, [node.title]);

  const handleSubmit = () => {
    if (onTitleChange && title.trim() !== node.title) {
      onTitleChange(title.trim());
    }
    if (onEditComplete) {
      onEditComplete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(node.title);
      if (onEditComplete) {
        onEditComplete();
      }
    }
  };

  if (isEditing) {
    return (
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="h-6 px-1 text-sm"
        autoFocus
      />
    );
  }

  return (
    <span className="text-sm font-medium truncate">
      {node.title}
    </span>
  );
};

export default ItemTitle;
