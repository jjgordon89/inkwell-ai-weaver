
import React from 'react';
import { Edit3, CheckCircle, Circle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { StoryArc } from '@/contexts/WritingContext';

interface StoryArcItemProps {
  storyArc: StoryArc;
  onEdit: (storyArc: StoryArc) => void;
  onToggleComplete: (storyArc: StoryArc) => void;
}

const StoryArcItem: React.FC<StoryArcItemProps> = ({ 
  storyArc, 
  onEdit, 
  onToggleComplete 
}) => {
  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        storyArc.completed 
          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
          : 'bg-card hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-grow">
          <button
            onClick={() => onToggleComplete(storyArc)}
            className="flex-shrink-0"
          >
            {storyArc.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
          <h3 className={`text-lg font-semibold ${
            storyArc.completed ? 'line-through text-muted-foreground' : ''
          }`}>
            {storyArc.title}
          </h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            onClick={() => onEdit(storyArc)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {storyArc.description && (
        <p className={`text-sm leading-relaxed ${
          storyArc.completed ? 'text-muted-foreground' : 'text-muted-foreground'
        }`}>
          {storyArc.description}
        </p>
      )}
    </div>
  );
};

export default StoryArcItem;
