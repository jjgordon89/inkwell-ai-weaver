import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionsMenu } from './ActionsMenu';
import type { DocumentNode } from '@/types/document';

interface ItemActionsProps {
  node: DocumentNode;
  isPermanentManuscript: boolean;
  canHaveChildren: boolean;
}

export const ItemActions: React.FC<ItemActionsProps> = React.memo(({
  node,
  isPermanentManuscript,
  canHaveChildren
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <ActionsMenu
        node={node}
        isPermanentManuscript={isPermanentManuscript}
        canHaveChildren={canHaveChildren}
      />
    </DropdownMenu>
  );
});

ItemActions.displayName = 'ItemActions';