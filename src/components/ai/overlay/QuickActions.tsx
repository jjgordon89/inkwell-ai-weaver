
import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  selectedText: string;
  onImproveSelection: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  selectedText,
  onImproveSelection
}) => {
  if (!selectedText) return null;

  return (
    <div className="mb-3 p-2 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Selected Text</span>
        <Button
          size="sm"
          variant="outline"
          onClick={onImproveSelection}
          className="h-6 text-xs"
        >
          Improve
        </Button>
      </div>
      <p className="text-xs text-muted-foreground truncate">
        "{selectedText.substring(0, 40)}..."
      </p>
    </div>
  );
};

export default QuickActions;
