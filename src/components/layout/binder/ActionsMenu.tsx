
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';
import { useBinderContext } from './BinderContext';
import type { DocumentNode } from '@/types/document';

interface ActionsMenuProps {
  node: DocumentNode;
  onRename: () => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ node, onRename }) => {
  const { onDelete, onAddChild, onEdit } = useBinderContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    onEdit(node);
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete(node.id);
    setIsOpen(false);
  };

  const handleAddChild = () => {
    if (node.type === 'folder' || node.type === 'chapter') {
      onAddChild(node.id);
    }
    setIsOpen(false);
  };

  const handleRename = () => {
    onRename();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleRename}>
          <Edit className="h-3 w-3 mr-2" />
          Rename
        </DropdownMenuItem>
        {(node.type === 'folder' || node.type === 'chapter') && (
          <DropdownMenuItem onClick={handleAddChild}>
            <Plus className="h-3 w-3 mr-2" />
            Add Child
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-3 w-3 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="h-3 w-3 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsMenu;
