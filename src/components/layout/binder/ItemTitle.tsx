import React, { useState, useEffect, useRef } from 'react';

interface ItemTitleProps {
  title: string;
  isEditing: boolean;
  onTitleChange?: (newTitle: string) => void;
  onEditComplete?: () => void;
}

const ItemTitle: React.FC<ItemTitleProps> = ({ 
  title, 
  isEditing, 
  onTitleChange,
  onEditComplete
}) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
    if (onTitleChange) {
      onTitleChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEditComplete) {
      e.preventDefault();
      onEditComplete();
    }
    if (e.key === 'Escape' && onEditComplete) {
      e.preventDefault();
      setEditedTitle(title); // Reset to original title
      onEditComplete();
    }
  };

  const handleBlur = () => {
    if (onEditComplete) {
      onEditComplete();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editedTitle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="flex-1 bg-background border border-input rounded-sm px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <span className="flex-1 text-sm font-medium truncate">
      {title}
    </span>
  );
};

export default ItemTitle;