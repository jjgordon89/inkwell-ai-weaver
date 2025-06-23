
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from '@/components/Editor';
import StoryStructureTools from '@/components/sections/story/StoryStructureTools';
import SmartWritingFeatures from '@/components/sections/story/SmartWritingFeatures';
import EnhancedAIPanel from '@/components/sections/story/EnhancedAIPanel';
import DocumentOutline from '@/components/sections/story/DocumentOutline';
import ChapterManagement from '@/components/sections/story/ChapterManagement';
import SmartNavigationPanel from './SmartNavigationPanel';
import AdaptiveLearningPanel from './AdaptiveLearningPanel';
import AdvancedWritingIntelligence from './AdvancedWritingIntelligence';
import CollaborativeAIFeatures from './CollaborativeAIFeatures';
import VisualEnhancementsPanel from '@/components/ai/VisualEnhancementsPanel';

const StoryTabs = () => {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-11 flex-shrink-0">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="ai-writing">AI Writing</TabsTrigger>
          <TabsTrigger value="enhanced-ai">Enhanced AI</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="smart-navigation">Navigation</TabsTrigger>
          <TabsTrigger value="adaptive">Learning</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="editor" className="mt-0 h-full overflow-hidden">
            <Editor />
          </TabsContent>

          <TabsContent value="structure" className="mt-0 h-full overflow-hidden">
            <StoryStructureTools />
          </TabsContent>

          <TabsContent value="ai-writing" className="mt-0 h-full overflow-hidden">
            <SmartWritingFeatures />
          </TabsContent>

          <TabsContent value="enhanced-ai" className="mt-0 h-full overflow-hidden">
            <EnhancedAIPanel />
          </TabsContent>

          <TabsContent value="intelligence" className="mt-0 h-full overflow-hidden">
            <AdvancedWritingIntelligence />
          </TabsContent>

          <TabsContent value="collaborative" className="mt-0 h-full overflow-hidden">
            <CollaborativeAIFeatures />
          </TabsContent>

          <TabsContent value="visual" className="mt-0 h-full overflow-hidden">
            <VisualEnhancementsPanel
              content="Sample story content for demonstration..."
              totalWords={15420}
              targetWords={50000}
            />
          </TabsContent>

          <TabsContent value="smart-navigation" className="mt-0 h-full overflow-hidden">
            <SmartNavigationPanel />
          </TabsContent>

          <TabsContent value="adaptive" className="mt-0 h-full overflow-hidden">
            <AdaptiveLearningPanel />
          </TabsContent>

          <TabsContent value="outline" className="mt-0 h-full overflow-hidden">
            <DocumentOutline />
          </TabsContent>

          <TabsContent value="chapters" className="mt-0 h-full overflow-hidden">
            <ChapterManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StoryTabs;
