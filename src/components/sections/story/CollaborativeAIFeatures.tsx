
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, GitBranch, Sparkles } from 'lucide-react';
import MultiPerspectiveSuggestions from '@/components/ai/MultiPerspectiveSuggestions';
import AIRevisionMode from '@/components/ai/AIRevisionMode';
import VersionComparison from '@/components/ai/VersionComparison';
import { useWriting } from '@/contexts/WritingContext';

const CollaborativeAIFeatures = () => {
  const { state } = useWriting();
  const [activeTab, setActiveTab] = useState('perspectives');
  const [revisionModeActive, setRevisionModeActive] = useState(false);

  const handleApplySuggestion = (suggestion: string) => {
    // This would integrate with the document editing system
    console.log('Applying suggestion:', suggestion);
  };

  const handleApplyRevisions = (revisions: any[]) => {
    // This would apply the revisions to the document
    console.log('Applying revisions:', revisions);
  };

  const currentContent = state.currentDocument?.content || '';
  const hasContent = currentContent.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Collaborative AI Features
        </CardTitle>
        <CardDescription>
          Multi-perspective suggestions, AI-guided revisions, and intelligent version comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perspectives" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Perspectives
            </TabsTrigger>
            <TabsTrigger value="revision" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Revision Mode
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              Version Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perspectives" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Multi-AI Analysis</Badge>
                {!hasContent && (
                  <Badge variant="secondary">Content Required</Badge>
                )}
              </div>
              
              <MultiPerspectiveSuggestions
                selectedText={state.selectedText}
                documentContent={currentContent}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          </TabsContent>

          <TabsContent value="revision" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">AI-Guided Editing</Badge>
                {revisionModeActive && (
                  <Badge variant="default">Active Session</Badge>
                )}
              </div>
              
              <AIRevisionMode
                documentContent={currentContent}
                isActive={revisionModeActive}
                onToggle={() => setRevisionModeActive(!revisionModeActive)}
                onApplyRevisions={handleApplyRevisions}
              />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Version Analysis</Badge>
                <Badge variant="secondary">AI Commentary</Badge>
              </div>
              
              <VersionComparison
                originalVersion="Previous version content here..."
                currentVersion={currentContent}
                onRestoreVersion={() => {
                  console.log('Restoring previous version');
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CollaborativeAIFeatures;
