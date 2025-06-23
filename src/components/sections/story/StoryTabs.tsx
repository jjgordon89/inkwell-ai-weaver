
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

const StoryTabs = () => {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-10">
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="structure">Structure</TabsTrigger>
        <TabsTrigger value="ai-writing">AI Writing</TabsTrigger>
        <TabsTrigger value="enhanced-ai">Enhanced AI</TabsTrigger>
        <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
        <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
        <TabsTrigger value="smart-navigation">Navigation</TabsTrigger>
        <TabsTrigger value="adaptive">Learning</TabsTrigger>
        <TabsTrigger value="outline">Outline</TabsTrigger>
        <TabsTrigger value="chapters">Chapters</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto">
        <TabsContent value="editor" className="mt-0 h-full">
          <Editor />
        </TabsContent>

        <TabsContent value="structure" className="mt-0 h-full">
          <StoryStructureTools />
        </TabsContent>

        <TabsContent value="ai-writing" className="mt-0 h-full">
          <SmartWritingFeatures />
        </TabsContent>

        <TabsContent value="enhanced-ai" className="mt-0 h-full">
          <EnhancedAIPanel />
        </TabsContent>

        <TabsContent value="intelligence" className="mt-0 h-full">
          <AdvancedWritingIntelligence />
        </TabsContent>

        <TabsContent value="collaborative" className="mt-0 h-full">
          <CollaborativeAIFeatures />
        </TabsContent>

        <TabsContent value="smart-navigation" className="mt-0 h-full">
          <SmartNavigationPanel />
        </TabsContent>

        <TabsContent value="adaptive" className="mt-0 h-full">
          <AdaptiveLearningPanel />
        </TabsContent>

        <TabsContent value="outline" className="mt-0 h-full">
          <DocumentOutline />
        </TabsContent>

        <TabsContent value="chapters" className="mt-0 h-full">
          <ChapterManagement />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default StoryTabs;
