
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Loader2, Heart } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useCharacterRelationships, InteractionSuggestion } from '@/hooks/useCharacterRelationships';
import { useToast } from "@/hooks/use-toast";

const InteractionSuggestionsTab = () => {
  const { state } = useWriting();
  const { generateInteractionSuggestions, isGenerating } = useCharacterRelationships();
  const { toast } = useToast();
  const [interactionSuggestions, setInteractionSuggestions] = useState<InteractionSuggestion[]>([]);

  const handleGenerateInteractions = async () => {
    try {
      const suggestions = await generateInteractionSuggestions();
      setInteractionSuggestions(suggestions);
      toast({
        title: "Interaction Suggestions Generated",
        description: `Created ${suggestions.length} character interaction ideas`,
      });
    } catch (error) {
      console.error('Failed to generate interactions:', error);
      toast({
        title: "Error",
        description: "Failed to generate interaction suggestions.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleGenerateInteractions}
        disabled={isGenerating || state.characters.length < 2}
        className="w-full"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Lightbulb className="h-4 w-4 mr-2" />
        )}
        Generate Interaction Ideas
      </Button>
      
      {state.characters.length < 2 && (
        <Alert>
          <AlertDescription>
            Add at least 2 characters to generate interaction suggestions.
          </AlertDescription>
        </Alert>
      )}
      
      {interactionSuggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Interaction Suggestions</h4>
          {interactionSuggestions.map((suggestion) => {
            const char1 = state.characters.find(c => c.id === suggestion.character1Id);
            const char2 = state.characters.find(c => c.id === suggestion.character2Id);
            
            return (
              <div 
                key={suggestion.id}
                className="p-4 rounded-lg bg-muted/50 border-l-2 border-purple-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{char1?.name}</span>
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm">{char2?.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{suggestion.type}</Badge>
                </div>
                <p className="text-sm mb-2">{suggestion.description}</p>
                {suggestion.context && (
                  <p className="text-xs text-muted-foreground italic">
                    {suggestion.context}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InteractionSuggestionsTab;
