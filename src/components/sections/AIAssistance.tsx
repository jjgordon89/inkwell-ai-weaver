
import React, { useState } from 'react';
import { Settings, Brain, Zap, TestTube, PanelRight } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useProject } from '@/contexts/useProject';
import { useWriting } from '@/contexts/WritingContext';
import AIProviderSettings from './ai-assistance/AIProviderSettings';
import AIModelSettings from './ai-assistance/AIModelSettings';
import AIConfigurationPanel from './ai-assistance/AIConfigurationPanel';
import LocalModelTester from '../ai/LocalModelTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StructureAwareAIAssistant } from '@/components/ai';

// Define the structure types supported by the AI assistant
type SupportedStructureType = 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';

const AIAssistance = () => {
  const { selectedProvider, selectedModel, isProcessing } = useAI();
  const { state: projectState } = useProject();
  const { state: writingState, dispatch: writingDispatch } = useWriting();
  
  // Set default active tab
  const [activeTab, setActiveTab] = useState<'settings' | 'assistant'>('assistant');
  
  // Get the structure type from the current project
  // Default to 'novel' if not available
  const structureType = projectState.currentProject?.structure || 'novel';
  
  // Extended structure type to include new types
  const extendedStructureType: SupportedStructureType = (
    structureType === 'novel' || 
    structureType === 'screenplay' || 
    structureType === 'research' || 
    structureType === 'poetry' || 
    structureType === 'academic' || 
    structureType === 'memoir' || 
    structureType === 'nonfiction'
      ? structureType as SupportedStructureType
      : 'novel'
  );

  // Get the active document content and selected text
  const currentDocument = writingState.currentDocument;
  const activeDocContent = currentDocument?.content || '';
  const selectedText = writingState.selectedText || '';
  
  // Function to apply AI results to the document
  const handleApplyAIResult = (result: string) => {
    if (!currentDocument) {
      return;
    }
    
    // If text is selected, replace it; otherwise append the result
    if (selectedText) {
      // Replace selected text with AI result
      const currentContent = activeDocContent;
      const newContent = currentContent.includes(selectedText) 
        ? currentContent.replace(selectedText, result)
        : currentContent + '\n\n' + result;
      
      writingDispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: currentDocument.id,
          content: newContent
        }
      });
    } else {
      // Append the result to the end of the document
      const newContent = activeDocContent + '\n\n' + result;
      
      writingDispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: currentDocument.id,
          content: newContent
        }
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Assistance</h2>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 animate-pulse" />
              Processing...
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'settings' | 'assistant')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <PanelRight className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant" className="space-y-6 flex-grow overflow-auto">
          <StructureAwareAIAssistant
            structureType={extendedStructureType}
            documentContent={activeDocContent}
            selectedText={selectedText}
            onApplyAIResult={handleApplyAIResult}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 flex-grow overflow-auto">
          {/* Provider Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Provider Settings</h3>
            </div>
            <AIProviderSettings />
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Model Configuration</h3>
            <AIModelSettings />
          </div>

          {/* Configuration Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            <AIConfigurationPanel />
          </div>

          {/* Local Model Tester */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Local Model Testing</h3>
            </div>
            <LocalModelTester />
          </div>

          {/* Current Configuration Summary */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Current Configuration</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">Provider:</span> {selectedProvider || 'None selected'}</p>
              <p><span className="font-medium">Model:</span> {selectedModel || 'None selected'}</p>
              <p><span className="font-medium">Status:</span> {isProcessing ? 'Processing' : 'Ready'}</p>
              <p><span className="font-medium">Document Structure:</span> {structureType}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistance;
