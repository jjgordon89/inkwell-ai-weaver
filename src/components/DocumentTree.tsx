
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from "@/components/ui/button";
import { FileText, Folder, FolderOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

const DocumentTree = () => {
  const { state, dispatch } = useProject();

  const renderDocumentNode = (node: any, level = 0) => {
    const isFolder = node.type === 'folder';
    const isActive = state.activeDocumentId === node.id;

    return (
      <div key={node.id} className="space-y-1">
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "w-full justify-start text-left h-8 px-2",
            level > 0 && `ml-${level * 4}`
          )}
          onClick={() => dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: node.id })}
        >
          {isFolder ? (
            <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          <span className="truncate">{node.title}</span>
        </Button>
        {node.children && node.children.map((child: any) => 
          renderDocumentNode(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {state.documentTree.map(node => renderDocumentNode(node))}
    </div>
  );
};

export default DocumentTree;
