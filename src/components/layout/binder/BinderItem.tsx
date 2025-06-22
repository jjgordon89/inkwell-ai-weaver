
import React from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, BookOpen, MoreHorizontal, Trash2, Edit3, Plus, GripVertical } from 'lucide-react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { DocumentNode } from '@/types/document';

interface BinderItemProps {
  node: DocumentNode;
  index: number;
  level: number;
  onSelect: (node: DocumentNode) => void;
  onToggle: (nodeId: string) => void;
  expandedNodes: Set<string>;
  selectedId?: string;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
}

const BinderItem = ({ 
  node, 
  index,
  level, 
  onSelect, 
  onToggle, 
  expandedNodes, 
  selectedId, 
  onDelete, 
  onAddChild 
}: BinderItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedId === node.id;
  const canHaveChildren = node.type === 'folder' || node.type === 'chapter';

  const getTypeIcon = () => {
    switch (node.type) {
      case 'folder': return <Folder className="h-4 w-4 text-blue-500" />;
      case 'chapter': return <BookOpen className="h-4 w-4 text-primary" />;
      case 'scene': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (node.status) {
      case 'final': return 'bg-green-500';
      case 'revised': return 'bg-blue-500';
      case 'first-draft': return 'bg-yellow-500';
      case 'draft': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Draggable draggableId={node.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <div
            className={`group flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 cursor-pointer rounded-sm transition-colors ${
              isSelected ? 'bg-muted border-l-2 border-l-primary' : ''
            } ${snapshot.isDragging ? 'bg-accent' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => onSelect(node)}
          >
            {/* Drag handle */}
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 p-0 h-4 w-4 flex items-center justify-center hover:bg-accent rounded cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>

            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(node.id);
                }}
                className="p-0 h-4 w-4 flex items-center justify-center hover:bg-accent rounded"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            ) : (
              <div className="w-4" />
            )}
            
            {getTypeIcon()}
            
            <span className="flex-1 text-sm font-medium truncate">{node.title}</span>
            
            {/* Status indicator */}
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            
            {node.wordCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {(node.wordCount / 1000).toFixed(1)}k
              </span>
            )}

            {/* Actions menu */}
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
                <DropdownMenuItem onClick={() => onSelect(node)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {canHaveChildren && (
                  <DropdownMenuItem onClick={() => onAddChild(node.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(node.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {hasChildren && isExpanded && canHaveChildren && (
            <Droppable droppableId={node.id} type="DOCUMENT">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`ml-4 ${
                    snapshot.isDraggingOver ? 'bg-muted/20 rounded-md min-h-[40px]' : ''
                  }`}
                >
                  {node.children!.map((child, childIndex) => (
                    <BinderItem
                      key={child.id}
                      node={child}
                      index={childIndex}
                      level={level + 1}
                      onSelect={onSelect}
                      onToggle={onToggle}
                      expandedNodes={expandedNodes}
                      selectedId={selectedId}
                      onDelete={onDelete}
                      onAddChild={onAddChild}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default BinderItem;
