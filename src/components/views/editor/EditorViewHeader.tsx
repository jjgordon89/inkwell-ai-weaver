
import React from 'react';
import { Edit3, Save, Clock, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EditorViewHeaderProps {
  title: string;
  status: string;
  hasUnsavedChanges: boolean;
  wordCount: number;
  suggestionsCount: number;
  onSave: () => void;
}

const EditorViewHeader: React.FC<EditorViewHeaderProps> = ({
  title,
  status,
  hasUnsavedChanges,
  wordCount,
  suggestionsCount,
  onSave
}) => {
  const getStatusColor = (status: string) => {
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
          <Edit3 className="h-4 w-4" />
          <h2 className="font-semibold">{title}</h2>
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {wordCount.toLocaleString()} words
          </div>
          
          {suggestionsCount > 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Brain className="h-3 w-3" />
              {suggestionsCount} AI suggestions
            </div>
          )}
          
          <Button 
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
