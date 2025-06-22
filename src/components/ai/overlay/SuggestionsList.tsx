
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from 'lucide-react';
import SuggestionItem from './SuggestionItem';

interface SuggestionsListProps {
  suggestions: Array<{
    id: string;
    type: 'completion' | 'improvement' | 'character' | 'plot';
    text: string;
    confidence: number;
    original?: string;
  }>;
  isAnalyzing: boolean;
  onApplySuggestion: (suggestion: any) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  isAnalyzing,
  onApplySuggestion,
  onDismissSuggestion
}) => {
  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            onApply={onApplySuggestion}
            onDismiss={onDismissSuggestion}
          />
        ))}

        {suggestions.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              Keep writing to get AI suggestions
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default SuggestionsList;
