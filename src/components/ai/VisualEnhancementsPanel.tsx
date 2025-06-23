
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, BarChart3, GitMerge } from 'lucide-react';
import AIWritingHeatmap from './AIWritingHeatmap';
import ProgressVisualization from './ProgressVisualization';
import InteractiveStoryMapping from './InteractiveStoryMapping';

interface VisualEnhancementsPanelProps {
  content: string;
  totalWords: number;
  targetWords: number;
}

const VisualEnhancementsPanel: React.FC<VisualEnhancementsPanelProps> = ({
  content,
  totalWords = 0,
  targetWords = 50000
}) => {
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  const handleGenerateMap = async () => {
    setIsGeneratingMap(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingMap(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Visual & Interactive Enhancements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              AI Heatmap
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Story Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="mt-6">
            <AIWritingHeatmap
              content={content}
              isEnabled={heatmapEnabled}
              onToggle={() => setHeatmapEnabled(!heatmapEnabled)}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <ProgressVisualization
              sessions={[]}
              totalWords={totalWords}
              targetWords={targetWords}
            />
          </TabsContent>

          <TabsContent value="mapping" className="mt-6">
            <InteractiveStoryMapping
              onGenerateMap={handleGenerateMap}
              isGenerating={isGeneratingMap}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualEnhancementsPanel;
