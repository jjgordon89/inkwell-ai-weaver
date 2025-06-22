
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface SelectedTextDisplayProps {
  selectedText: string;
}

const SelectedTextDisplay: React.FC<SelectedTextDisplayProps> = ({
  selectedText
}) => {
  return (
    <div className="p-3 bg-muted/50 rounded-lg border">
      <p className="text-sm font-medium mb-1">Selected Text:</p>
      <p className="text-sm text-muted-foreground italic">
        "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
      </p>
      <div className="flex gap-2 mt-2">
        <Badge variant="outline" className="text-xs">
          {selectedText.split(' ').length} words
        </Badge>
        <Badge variant="outline" className="text-xs">
          {selectedText.length} characters
        </Badge>
      </div>
    </div>
  );
};

export default SelectedTextDisplay;
