
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  Lightbulb, 
  Users, 
  BookOpen, 
  X, 
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useWriting } from '@/contexts/WritingContext';

const AIAssistantOverlay: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const { 
    suggestions, 
    isAnalyzing, 
    dismissSuggestion, 
    clearAllSuggestions,
    improveSelectedText 
  } = useCollaborativeAI();
  const { state, dispatch } = useWriting();

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

  const handleApplySuggestion = async (suggestion: any) => {
    if (suggestion.type === 'improvement' && suggestion.original) {
      // Apply text improvement
      if (state.currentDocument) {
        const newContent = state.currentDocument.content.replace(
          suggestion.original,
          suggestion.text
        );
        dispatch({
          type: 'UPDATE_DOCUMENT_CONTENT',
          payload: {
            id: state.currentDocument.id,
            content: newContent
          }
        });
      }
    }
    dismissSuggestion(suggestion.id);
  };

  const handleImproveSelection = async () => {
    if (state.selectedText) {
      const improvement = await improveSelectedText(state.selectedText);
      if (improvement) {
        handleApplySuggestion(improvement);
      }
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-12 w-12 shadow-lg"
          title="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50 shadow-2xl">
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-primary" />
              AI Writing Assistant
              {isAnalyzing && (
                <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-4 py-1 h-8">
              <span className="text-xs">
                {suggestions.length > 0 ? `${suggestions.length} suggestions` : 'No suggestions'}
              </span>
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-2">
              {/* Quick Actions */}
              {state.selectedText && (
                <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Selected Text</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleImproveSelection}
                      className="h-6 text-xs"
                    >
                      Improve
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    "{state.selectedText.substring(0, 40)}..."
                  </p>
                </div>
              )}

              {/* Suggestions List */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
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
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
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
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="h-6 text-xs"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
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

              {suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSuggestions}
                    className="w-full h-6 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default AIAssistantOverlay;
