
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Globe, Brain, Sliders, TestTube, Settings } from 'lucide-react';
import AIProviderSettings from '@/components/sections/ai-assistance/AIProviderSettings';
import AIModelSettings from '@/components/sections/ai-assistance/AIModelSettings';
import AIConfigurationPanel from '@/components/sections/ai-assistance/AIConfigurationPanel';
import TestAIConfiguration from '@/components/sections/ai-assistance/TestAIConfiguration';
import ConfigurationStatus from '@/components/sections/ai-assistance/ConfigurationStatus';
import { useAI } from '@/hooks/useAI';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'overview'
}) => {
  const { 
    selectedProvider, 
    selectedModel, 
    processText, 
    isProcessing, 
    isCurrentProviderConfigured 
  } = useAI();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI providers, models, and preferences for writing assistance.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Test
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <TabsContent value="overview" className="space-y-4">
              <ConfigurationStatus
                isCurrentProviderConfigured={isCurrentProviderConfigured}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
              />
              <AIConfigurationPanel />
            </TabsContent>
            
            <TabsContent value="provider" className="space-y-4">
              <AIProviderSettings />
            </TabsContent>
            
            <TabsContent value="model" className="space-y-4">
              <AIModelSettings />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <AIConfigurationPanel />
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <TestAIConfiguration
                processText={processText}
                isProcessing={isProcessing}
                isCurrentProviderConfigured={isCurrentProviderConfigured}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsModal;
