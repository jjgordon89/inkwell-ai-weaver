
import React from 'react';
import { Button } from "@/components/ui/button";
import { Target, Loader2, Plus } from 'lucide-react';

interface ContextSuggestionsTabProps {
  suggestions: string[];
  onGenerateSuggestions: () => void;
  onApplySuggestion: (suggestion: string) => void;
  isProcessing: boolean;
  hasDocument: boolean;
}

const ContextSuggestionsTab: React.FC<ContextSuggestionsTabProps> = ({
  suggestions,
  onGenerateSuggestions,
  onApplySuggestion,
  isProcessing,
  hasDocument
}) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={onGenerateSuggestions}
        disabled={isProcessing || !hasDocument}
        className="w-full"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Target className="h-4 w-4 mr-2" />
        )}
        Generate Context-Aware Suggestions
      </Button>
      
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Context-Aware Suggestions</h4>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="p-3 rounded-lg bg-muted/50 border-l-2 border-blue-500/30 group hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1">{suggestion}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApplySuggestion(suggestion)}
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

export default ContextSuggestionsTab;
