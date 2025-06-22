
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';
import { Button } from "@/components/ui/button";
import { FileText, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const DocumentTree = () => {
  const { state: projectState, dispatch: projectDispatch } = useProject();
  const { dispatch: writingDispatch } = useWriting();

  const handleDocumentClick = (documentId: string) => {
    projectDispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: documentId });
    writingDispatch({ type: 'SET_CURRENT_DOCUMENT', payload: documentId });
  };

  const renderDocument = (doc: any, level = 0) => {
    const isFolder = doc.type === 'folder';
    const Icon = isFolder ? Folder : FileText;
    
    return (
      <div key={doc.id} className={cn("", level > 0 && "ml-4")}>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left h-8 px-2"
          onClick={() => !isFolder && handleDocumentClick(doc.id)}
        >
          <Icon className="h-4 w-4 mr-2" />
          <span className="truncate">{doc.title}</span>
        </Button>
        {doc.children && doc.children.map((child: any) => renderDocument(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {projectState.documentTree.map(doc => renderDocument(doc))}
    </div>
  );
};

export default DocumentTree;
