
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Lightbulb, Users, Zap, BookOpen } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import AITextProcessor from './AITextProcessor';
import EnhancedAIPanel from './EnhancedAIPanel';
import SmartWritingFeatures from './SmartWritingFeatures';
import CollaborativeWriting from './CollaborativeWriting';

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
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="ai-tools" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          AI Tools
        </TabsTrigger>
        <TabsTrigger value="collaboration" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Collaboration
        </TabsTrigger>
        <TabsTrigger value="features" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Features
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-6">
        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Current Document
              </span>
              {state.currentDocument && (
                <Badge variant="outline" className="text-sm">
                  {state.currentDocument.title}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Document information and writing progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold text-primary mb-1">{stats.words}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold text-primary mb-1">{stats.characters}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold text-primary mb-1">{stats.sentences}</div>
                <div className="text-sm text-muted-foreground">Sentences</div>
              </div>
            </div>
            {state.currentDocument && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last modified: {state.currentDocument.lastModified.toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai-tools" className="space-y-6 mt-6">
        <div className="grid gap-6">
          <AITextProcessor />
          <EnhancedAIPanel />
        </div>
      </TabsContent>

      <TabsContent value="collaboration" className="space-y-6 mt-6">
        <CollaborativeWriting />
      </TabsContent>

      <TabsContent value="features" className="space-y-6 mt-6">
        <SmartWritingFeatures />
      </TabsContent>
    </Tabs>
  );
};

export default StoryTabs;
