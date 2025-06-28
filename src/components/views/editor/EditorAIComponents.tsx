
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, X } from 'lucide-react';
import type { DocumentNode } from '@/types/document';

interface AISuggestion {
  id: string;
  text: string;
  type: 'improvement' | 'continuation' | 'correction';
  confidence: number;
}

interface EditorAIComponentsProps {
  activeDocument: DocumentNode;
  selectedText: string;
  selectionPosition: { x: number; y: number };
  showInlineSuggestions: boolean;
  suggestions: AISuggestion[];
  onContentChange: (content: string) => void;
  onApplyAISuggestion: (text: string) => void;
  onDismissInlineSuggestions: () => void;
}

const EditorAIComponents = ({
  selectedText,
  selectionPosition,
  showInlineSuggestions,
  suggestions,
  onApplyAISuggestion,
  onDismissInlineSuggestions
}: EditorAIComponentsProps) => {
  if (!showInlineSuggestions || !selectedText) {
    return null;
  }

  return (
    <div
      className="absolute z-50 w-80 max-w-sm"
      style={{
        left: selectionPosition.x,
        top: selectionPosition.y,
      }}
    >
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissInlineSuggestions}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div key={suggestion.id} className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {suggestion.text}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyAISuggestion(suggestion.text)}
                    className="w-full"
                  >
                    Apply Suggestion
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No suggestions available for the selected text.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorAIComponents;
