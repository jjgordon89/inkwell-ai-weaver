
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  Minimize2
} from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useWriting } from '@/contexts/WritingContext';
import QuickActions from './overlay/QuickActions';
import SuggestionsList from './overlay/SuggestionsList';

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
              <QuickActions
                selectedText={state.selectedText}
                onImproveSelection={handleImproveSelection}
              />

              <SuggestionsList
                suggestions={suggestions}
                isAnalyzing={isAnalyzing}
                onApplySuggestion={handleApplySuggestion}
                onDismissSuggestion={dismissSuggestion}
              />

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
