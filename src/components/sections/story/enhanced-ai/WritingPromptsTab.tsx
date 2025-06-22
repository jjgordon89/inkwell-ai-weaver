
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Loader2, Plus } from 'lucide-react';
import { WritingPrompt } from '@/hooks/ai/types';

interface WritingPromptsTabProps {
  writingPrompts: WritingPrompt[];
  onGeneratePrompt: () => void;
  onApplySuggestion: (suggestion: string) => void;
  isProcessing: boolean;
}

const WritingPromptsTab: React.FC<WritingPromptsTabProps> = ({
  writingPrompts,
  onGeneratePrompt,
  onApplySuggestion,
  isProcessing
}) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={onGeneratePrompt}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <PenTool className="h-4 w-4 mr-2" />
        )}
        Generate Writing Prompt
      </Button>
      
      {writingPrompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Writing Prompts</h4>
          {writingPrompts.map((prompt) => (
            <div 
              key={prompt.id}
              className="p-4 rounded-lg bg-muted/50 border-l-2 border-orange-500/30 group hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-medium text-sm">{prompt.title}</h5>
                <Badge variant="outline" className="text-xs">{prompt.genre}</Badge>
                <Badge variant="secondary" className="text-xs">{prompt.difficulty}</Badge>
              </div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-muted-foreground flex-1">{prompt.prompt}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApplySuggestion(`Writing Prompt: ${prompt.prompt}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingPromptsTab;
