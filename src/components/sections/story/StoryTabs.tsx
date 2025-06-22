
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Lightbulb, Users, Zap, BookOpen, Map } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { SectionCard } from '@/components/ui/section-card';
import AITextProcessor from './AITextProcessor';
import EnhancedAIPanel from './EnhancedAIPanel';
import SmartWritingFeatures from './SmartWritingFeatures';
import CollaborativeWriting from './CollaborativeWriting';
import ChapterManagement from './ChapterManagement';
import DocumentOutline from './DocumentOutline';
import PacingAnalyzer from './PacingAnalyzer';
import ConflictTracker from './ConflictTracker';
import QuickAISettings from '../../ai/QuickAISettings';

const StoryTabs = () => {
  const { state } = useWriting();

  const getWritingStats = () => {
    if (!state.currentDocument) return { words: 0, characters: 0, sentences: 0 };
    
    const content = state.currentDocument.content;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const characters = content.length;
    const sentences = content.split(/[.!?]+/).filter(Boolean).length;
    
    return { words, characters, sentences };
  };

  const stats = getWritingStats();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Structure</span>
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">AI Tools</span>
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Collaboration</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <SectionCard
              title="Current Document"
              description="Document information and writing progress"
              icon={<FileText className="h-5 w-5" />}
              actions={
                state.currentDocument && (
                  <Badge variant="outline" className="text-sm">
                    {state.currentDocument.title}
                  </Badge>
                )
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-3xl font-bold text-primary mb-1">{stats.words}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.characters}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.sentences}</div>
                  <div className="text-sm text-muted-foreground">Sentences</div>
                </div>
              </div>
              {state.currentDocument && (
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last modified: {state.currentDocument.lastModified.toLocaleString()}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="mt-6">
          <div className="space-y-6">
            <ChapterManagement />
            <DocumentOutline />
          </div>
        </TabsContent>

        <TabsContent value="ai-tools" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <QuickAISettings showLabel={false} variant="outline" size="sm" />
            </div>
            <AITextProcessor />
            <EnhancedAIPanel />
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="mt-6">
          <CollaborativeWriting />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="space-y-6">
            <SmartWritingFeatures />
            <PacingAnalyzer />
            <ConflictTracker />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoryTabs;
