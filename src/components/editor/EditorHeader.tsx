
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Sidebar, Undo, Redo } from 'lucide-react';

interface EditorHeaderProps {
  title: string;
  suggestionsCount: number;
  showProactivePanel: boolean;
  onToggleProactivePanel: () => void;
  onToggleSuggestions?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  suggestionsCount,
  showProactivePanel,
  onToggleProactivePanel,
  onToggleSuggestions,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {(onUndo || onRedo) && (
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-7 px-2"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-7 px-2"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-4">
        <span>Auto-save enabled</span>
        {suggestionsCount > 0 && onToggleSuggestions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSuggestions}
            className="flex items-center gap-1 h-7 px-2"
          >
            <Brain className="h-3 w-3" />
            {suggestionsCount} AI suggestions
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleProactivePanel}
          className="flex items-center gap-1"
        >
          <Sidebar className="h-3 w-3" />
          Writing Assistant
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
