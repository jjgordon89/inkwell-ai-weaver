
import React from 'react';
import { Save, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from '@/types/document';

interface EditorViewHeaderProps {
  title: string;
  status: DocumentStatus;
  hasUnsavedChanges: boolean;
  wordCount: number;
  suggestionsCount: number;
  onSave: () => void;
}

const EditorViewHeader = ({
  title,
  status,
  hasUnsavedChanges,
  wordCount,
  suggestionsCount,
  onSave
}: EditorViewHeaderProps) => {
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'revised': return 'bg-blue-100 text-blue-800';
      case 'first-draft': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 border-b bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          <Badge className={getStatusColor(status)}>
            {status.replace('-', ' ')}
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-xs">
              Unsaved
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {wordCount.toLocaleString()} words
          </div>
          
          {suggestionsCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <Lightbulb className="h-4 w-4" />
              {suggestionsCount}
            </div>
          )}
          
          <Button
            variant={hasUnsavedChanges ? "default" : "ghost"}
            size="sm"
            onClick={onSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorViewHeader;
