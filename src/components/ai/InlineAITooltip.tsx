
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Lightbulb, Wand2 } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface InlineAITooltipProps {
  selectedText: string;
  onApply: (newText: string) => void;
  onDismiss: () => void;
  position: { x: number; y: number };
  showQuickActions?: boolean;
}

const InlineAITooltip: React.FC<InlineAITooltipProps> = ({
  selectedText,
  onApply,
  onDismiss,
  position,
  showQuickActions = true
}) => {
  const [improvement, setImprovement] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { improveSelectedText } = useCollaborativeAI();

  useEffect(() => {
    const generateImprovement = async () => {
      if (!selectedText || selectedText.length < 5) return;
      
      setIsLoading(true);
      try {
        const result = await improveSelectedText(selectedText);
        if (result) {
          setImprovement(result.text);
        }
      } catch (error) {
        console.error('Failed to generate improvement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateImprovement, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedText, improveSelectedText]);

  if (!selectedText) return null;

  return (
    <Card
      className="absolute z-50 w-72 p-3 shadow-lg border bg-background/95 backdrop-blur-sm"
      style={{
        left: Math.min(position.x, window.innerWidth - 288),
        top: Math.max(position.y - 80, 10)
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          <span>AI Suggestion</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-xs text-muted-foreground">Analyzing...</span>
          </div>
        ) : improvement ? (
          <div className="space-y-2">
            <div className="text-xs bg-muted/50 p-2 rounded">
              <span className="font-medium">Original: </span>
              <span className="text-muted-foreground">"{selectedText}"</span>
            </div>
            <div className="text-xs bg-primary/5 p-2 rounded border border-primary/20">
              <span className="font-medium">Suggested: </span>
              <span>"{improvement}"</span>
            </div>
            {showQuickActions && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => onApply(improvement)}
                  className="h-6 text-xs flex-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Apply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2">
            No suggestions available
          </div>
        )}
      </div>
    </Card>
  );
};

export default InlineAITooltip;
