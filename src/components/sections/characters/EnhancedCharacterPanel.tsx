
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  GitBranch, 
  MessageSquare, 
  Lightbulb,
  Loader2,
  Target,
  TrendingUp,
  Heart
} from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useCharacterRelationships, InteractionSuggestion, VoiceConsistencyCheck } from '@/hooks/useCharacterRelationships';
import { useToast } from "@/hooks/use-toast";
import CharacterRelationshipMap from './CharacterRelationshipMap';

const EnhancedCharacterPanel = () => {
  const { state } = useWriting();
  const { 
    relationshipNetwork,
    generateInteractionSuggestions,
    checkVoiceConsistency,
    characterArcs,
    addCharacterArc,
    getCharacterArcs,
    isAnalyzing,
    isGenerating
  } = useCharacterRelationships();
  
  const { toast } = useToast();
  
  const [interactionSuggestions, setInteractionSuggestions] = useState<InteractionSuggestion[]>([]);
  const [voiceChecks, setVoiceChecks] = useState<VoiceConsistencyCheck[]>([]);

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

  const handleVoiceCheck = async (characterId: string) => {
    try {
      const check = await checkVoiceConsistency(characterId);
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
    } catch (error) {
      console.error('Failed to check voice consistency:', error);
      toast({
        title: "Error",
        description: "Failed to analyze voice consistency.",
        variant: "destructive",
      });
    }
  };

  const isProcessing = isAnalyzing || isGenerating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Enhanced Character Tools
        </CardTitle>
        <CardDescription>
          Advanced character development and relationship analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="relationships" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="relationships">Network</TabsTrigger>
            <TabsTrigger value="interactions">Ideas</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="arcs">Arcs</TabsTrigger>
          </TabsList>

          <TabsContent value="relationships" className="space-y-4">
            <CharacterRelationshipMap 
              nodes={relationshipNetwork.nodes} 
              links={relationshipNetwork.links} 
            />
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleGenerateInteractions}
                disabled={isProcessing || state.characters.length < 2}
                className="w-full"
              >
                {isProcessing ? (
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
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="space-y-3">
              <div className="grid gap-2">
                {state.characters.map((character) => (
                  <div key={character.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{character.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVoiceCheck(character.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
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
          </TabsContent>

          <TabsContent value="arcs" className="space-y-4">
            <div className="space-y-3">
              <div className="text-center py-6">
                <GitBranch className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Character arc tracking will be implemented in the next update.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedCharacterPanel;
