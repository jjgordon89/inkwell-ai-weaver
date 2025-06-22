
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Wand2, Zap, Plus } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface InlineAISuggestionsProps {
  selectedText: string;
  onApply: (newText: string) => void;
  onDismiss: () => void;
  position: { x: number; y: number };
}

const InlineAISuggestions: React.FC<InlineAISuggestionsProps> = ({
  selectedText,
  onApply,
  onDismiss,
  position
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { improveSelectedText, generateTextCompletion } = useCollaborativeAI();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!selectedText || selectedText.length < 3) return;
      
      setIsLoading(true);
      try {
        const improvement = await improveSelectedText(selectedText);
        if (improvement) {
          setSuggestions([improvement.text]);
        }
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [selectedText, improveSelectedText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onDismiss]);

  if (!selectedText) return null;

  return (
    <Card
      ref={cardRef}
      className="absolute z-50 w-80 p-3 shadow-2xl border-2 border-primary/20"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.max(position.y - 100, 10)
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Suggestions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="p-2 bg-muted/50 rounded text-xs">
          <span className="font-medium">Selected: </span>
          <span className="text-muted-foreground">
            "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 rounded border bg-card hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm mb-2">{suggestion}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApply(suggestion)}
                    className="h-6 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    AI Enhanced
                  </Badge>
                </div>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-xs">No suggestions available</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Shorten
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Expand
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InlineAISuggestions;
