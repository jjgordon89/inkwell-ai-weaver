import React from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';

interface ActionsMenuProps {
  node: DocumentNode;
  isPermanentManuscript: boolean;
  canHaveChildren: boolean;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = React.memo(({
  node,
  isPermanentManuscript,
  canHaveChildren
}) => {
  const { onEdit, onAddChild, onDelete } = useBinderContext();

  return (
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit(node)}>
        <Edit3 className="h-4 w-4 mr-2" />
        Edit
      </DropdownMenuItem>
      {canHaveChildren && (
        <DropdownMenuItem onClick={() => onAddChild(node.id)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Child
        </DropdownMenuItem>
      )}
      {!isPermanentManuscript && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(node.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );
});

ActionsMenu.displayName = 'ActionsMenu';