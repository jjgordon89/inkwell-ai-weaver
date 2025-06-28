
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ExpandCollapseButtonProps {
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
}

const ExpandCollapseButton: React.FC<ExpandCollapseButtonProps> = ({
  isExpanded,
  hasChildren,
  onToggle
}) => {
  if (!hasChildren) {
    return <div className="w-4 h-4" />; // Spacer
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-4 w-4 p-0"
      onClick={onToggle}
    >
      {isExpanded ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
    </Button>
  );
};

export default ExpandCollapseButton;
