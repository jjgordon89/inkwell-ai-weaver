
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Undo2, 
  Redo2, 
  Lightbulb, 
  Brain,
  FileText
} from 'lucide-react';
import ContinueWritingButton from './ContinueWritingButton';
import { EditorTextareaRef } from './EditorTextarea';

interface EditorHeaderProps {
  title: string;
  suggestionsCount: number;
  showProactivePanel: boolean;
  onToggleProactivePanel: () => void;
  onToggleSuggestions: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  textareaRef?: React.RefObject<EditorTextareaRef>;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  suggestionsCount,
  showProactivePanel,
  onToggleProactivePanel,
  onToggleSuggestions,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  textareaRef
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-medium text-sm truncate max-w-[200px]">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ContinueWritingButton 
          textareaRef={textareaRef}
          className="mr-2"
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSuggestions}
          className="relative"
          title="AI Suggestions"
        >
          <Lightbulb className="h-4 w-4" />
          {suggestionsCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
              {suggestionsCount}
            </Badge>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleProactivePanel}
          className={showProactivePanel ? 'bg-primary/10' : ''}
          title="AI Assistant"
        >
          <Brain className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
