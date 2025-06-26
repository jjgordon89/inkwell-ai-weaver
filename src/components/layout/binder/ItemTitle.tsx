import React from 'react';

interface ItemTitleProps {
  title: string;
}

export const ItemTitle: React.FC<ItemTitleProps> = React.memo(({ title }) => {
  return (
    <span className="flex-1 text-sm font-medium truncate">{title}</span>
  );
});

ItemTitle.displayName = 'ItemTitle';