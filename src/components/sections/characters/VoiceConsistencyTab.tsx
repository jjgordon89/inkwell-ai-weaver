import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2 } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useCharacterRelationships, VoiceConsistencyCheck } from '@/hooks/useCharacterRelationships';
import { useToast } from "@/hooks/use-toast";

const VoiceConsistencyTab = () => {
  const { state } = useWriting();
  const { checkVoiceConsistency, isAnalyzing } = useCharacterRelationships();
  const { toast } = useToast();
  const [voiceChecks, setVoiceChecks] = useState<VoiceConsistencyCheck[]>([]);

  const handleVoiceCheck = async (characterId: string) => {
    try {
      const check = await checkVoiceConsistency(characterId);
      if (check) {
        setVoiceChecks(prev => {
          const existing = prev.findIndex(v => v.characterId === characterId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = check;
            return updated;
          }
          return [...prev, check];
        });
        
        const character = state.characters.find(c => c.id === characterId);
        toast({
          title: "Voice Analysis Complete",
          description: `${character?.name}'s voice consistency: ${check.consistency}%`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to analyze voice consistency.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to check voice consistency:', error);
      toast({
        title: "Error",
        description: "Failed to analyze voice consistency.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {state.characters.map((character) => (
          <div key={character.id} className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm font-medium">{character.name}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleVoiceCheck(character.id)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <MessageSquare className="h-3 w-3 mr-1" />
              )}
              Check Voice
            </Button>
          </div>
        ))}
      </div>
      
      {voiceChecks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Voice Consistency Results</h4>
          {voiceChecks.map((check) => {
            const character = state.characters.find(c => c.id === check.characterId);
            return (
              <div 
                key={check.characterId}
                className="p-4 rounded-lg bg-muted/50 border-l-2 border-blue-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{character?.name}</span>
                  <Badge 
                    variant={check.consistency >= 80 ? "default" : check.consistency >= 60 ? "secondary" : "destructive"}
                  >
                    {check.consistency}% consistent
                  </Badge>
                </div>
                
                {check.issues.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-xs font-medium mb-1">Issues:</h5>
                    {check.issues.map((issue, index) => (
                      <p key={index} className="text-xs text-red-600 dark:text-red-400">
                        • {issue}
                      </p>
                    ))}
                  </div>
                )}
                
                {check.suggestions.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium mb-1">Suggestions:</h5>
                    {check.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-xs text-green-600 dark:text-green-400">
                        • {suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VoiceConsistencyTab;
