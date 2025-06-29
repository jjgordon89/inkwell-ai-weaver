import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Brain, Check, Lightbulb, Users, BookOpen } from 'lucide-react';

interface AISuggestion {
  id: string;
  type: 'completion' | 'improvement' | 'character' | 'plot';
  text: string;
  confidence: number;
  position?: { start: number; end: number };
  original?: string;
}

interface SuggestionsPanelProps {
  suggestions: AISuggestion[];
  isVisible: boolean;
  onClose: () => void;
  onApplySuggestion: (suggestion: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  isVisible,
  onClose,
  onApplySuggestion,
  onDismissSuggestion
}) => {
  if (!isVisible) return null;

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
    <div className="absolute right-4 top-16 w-80 z-50">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              AI Suggestions
              <Badge variant="secondary" className="text-xs">
                {suggestions.length}
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getSuggestionIcon(suggestion.type)}
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getSuggestionColor(suggestion.confidence)}`}
                      >
                        {suggestion.confidence}%
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {suggestion.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissSuggestion(suggestion.id)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-sm mb-3 text-muted-foreground">
                    {suggestion.text}
                  </p>
                  
                  {suggestion.original && (
                    <div className="mb-3 p-2 bg-muted/30 rounded text-xs">
                      <span className="font-medium">Original: </span>
                      <span>"{suggestion.original}"</span>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => onApplySuggestion(suggestion.text)}
                    className="h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                </div>
              ))}

              {suggestions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No suggestions available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionsPanel;
