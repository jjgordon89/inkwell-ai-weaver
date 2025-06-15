
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from 'lucide-react';
import { useCharacterRelationships } from '@/hooks/useCharacterRelationships';
import CharacterRelationshipMap from './CharacterRelationshipMap';
import InteractionSuggestionsTab from './InteractionSuggestionsTab';
import VoiceConsistencyTab from './VoiceConsistencyTab';
import CharacterArcsTab from './CharacterArcsTab';

const EnhancedCharacterPanel = () => {
  const { relationshipNetwork } = useCharacterRelationships();

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
            <InteractionSuggestionsTab />
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <VoiceConsistencyTab />
          </TabsContent>

          <TabsContent value="arcs" className="space-y-4">
            <CharacterArcsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedCharacterPanel;
