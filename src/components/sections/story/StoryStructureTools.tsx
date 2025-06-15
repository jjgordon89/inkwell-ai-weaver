
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitMerge } from 'lucide-react';
import ThreeActStructure from './ThreeActStructure';
import ScenePlanner from './ScenePlanner';
import ConflictTracker from './ConflictTracker';
import PacingAnalyzer from './PacingAnalyzer';

const StoryStructureTools = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitMerge className="h-5 w-5 text-primary" />
          Story Structure Tools
        </CardTitle>
        <CardDescription>
          Comprehensive tools for planning and analyzing your story structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="scenes">Scenes</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="pacing">Pacing</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            <ThreeActStructure />
          </TabsContent>

          <TabsContent value="scenes" className="space-y-4">
            <ScenePlanner />
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <ConflictTracker />
          </TabsContent>

          <TabsContent value="pacing" className="space-y-4">
            <PacingAnalyzer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StoryStructureTools;
