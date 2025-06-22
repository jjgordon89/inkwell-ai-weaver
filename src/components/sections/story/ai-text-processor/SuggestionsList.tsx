
import React from 'react';
import { Button } from "@/components/ui/button";
import TextSuggestionCard from './TextSuggestionCard';

interface TextSuggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  action: string;
  confidence: number;
}

interface SuggestionsListProps {
  suggestions: TextSuggestion[];
  onApplySuggestion: (suggestion: TextSuggestion) => void;
  onCancel: () => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  onApplySuggestion,
  onCancel
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Choose a suggestion:</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
      
      {suggestions.map((suggestion, index) => (
        <TextSuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          index={index}
          onApply={onApplySuggestion}
        />
      ))}
    </div>
  );
};

export default SuggestionsList;
