
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from 'lucide-react';

interface TextSuggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  action: string;
  confidence: number;
}

interface TextSuggestionCardProps {
  suggestion: TextSuggestion;
  index: number;
  onApply: (suggestion: TextSuggestion) => void;
}

const TextSuggestionCard: React.FC<TextSuggestionCardProps> = ({
  suggestion,
  index,
  onApply
}) => {
  return (
    <div 
      className="p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => onApply(suggestion)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              Option {index + 1}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {suggestion.confidence}% confidence
            </Badge>
          </div>
          <p className="text-sm">{suggestion.suggestedText}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
};

export default TextSuggestionCard;
