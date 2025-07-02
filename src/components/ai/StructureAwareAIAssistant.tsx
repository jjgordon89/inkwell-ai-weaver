import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StructureAIToolbar } from './StructureAIToolbar';
import { StructureAISuggestionsPanel } from './StructureAISuggestionsPanel';
import AISettingsPanel from '@/components/settings/AISettingsPanel';
import { Sparkles, Settings, Lightbulb } from 'lucide-react';

interface StructureAwareAIAssistantProps {
  structureType: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
  documentContent: string;
  selectedText: string;
  onApplyAIResult: (result: string) => void;
}

export function StructureAwareAIAssistant({
  structureType,
  documentContent,
  selectedText,
  onApplyAIResult
}: StructureAwareAIAssistantProps) {
  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Structure-Aware AI Assistant
          </CardTitle>
          <CardDescription>
            AI tools optimized for {structureType} writing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Select text and use the AI tools below:
            </p>
            <StructureAIToolbar
              structureType={structureType}
              selectedText={selectedText}
              onApplyAIResult={onApplyAIResult}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="suggestions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggestions" className="mt-4">
          <StructureAISuggestionsPanel
            structureType={structureType}
            documentContent={documentContent}
            onApplySuggestion={onApplyAIResult}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <AISettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
