import React from 'react';
import { MoreHorizontal, Edit3, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';

interface ActionsMenuProps {
  node: DocumentNode;
  onRename?: () => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ node, onRename }) => {
  const { onDelete, onAddChild, onEdit } = useBinderContext();
  
  // Check if this is the permanent Manuscript folder
  const isPermanentManuscript = node.id === 'manuscript-root' || 
    (node.title === 'Manuscript' && node.type === 'folder' && node.labels?.includes('permanent'));
  
  // Check if this node can have children
  const canHaveChildren = node.type === 'folder' || node.type === 'chapter';

  const handleEdit = () => {
    if (onRename) {
      onRename();
    } else {
      onEdit(node);
    }
  };

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
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit3 className="h-4 w-4 mr-2" />
          Rename
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
    </DropdownMenu>
  );
};

export default ActionsMenu;