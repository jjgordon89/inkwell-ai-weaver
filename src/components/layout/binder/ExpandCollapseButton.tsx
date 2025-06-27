import React from 'react';
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
    return <div className="w-4" />;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="p-0 h-4 w-4 flex items-center justify-center hover:bg-accent rounded"
    >
      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
    </button>
  );
};

export default ExpandCollapseButton;