
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Lightbulb, 
  Users, 
  BookOpen 
} from 'lucide-react';

interface SuggestionItemProps {
  suggestion: {
    id: string;
    type: 'completion' | 'improvement' | 'character' | 'plot';
    text: string;
    confidence: number;
    original?: string;
  };
  onApply: (suggestion: any) => void;
  onDismiss: (suggestionId: string) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  onApply,
  onDismiss
}) => {
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'character': return <Users className="h-4 w-4" />;
      case 'plot': return <BookOpen className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {getSuggestionIcon(suggestion.type)}
          <Badge
            variant="secondary"
            className={`text-xs ${getSuggestionColor(suggestion.confidence)}`}
          >
            {suggestion.confidence}%
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(suggestion.id)}
          className="h-4 w-4 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-xs mb-2">{suggestion.text}</p>
      
      {suggestion.original && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onApply(suggestion)}
          className="h-6 text-xs"
        >
          Apply
        </Button>
      )}
    </div>
  );
};

export default SuggestionItem;
