
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAISettings } from '@/contexts/AISettingsContext';
import AIProviderSettings from '@/components/sections/ai-assistance/AIProviderSettings';
import AIModelSettings from '@/components/sections/ai-assistance/AIModelSettings';
import AIConfigurationPanel from '@/components/sections/ai-assistance/AIConfigurationPanel';
import { Brain, Settings, Zap } from 'lucide-react';

const AISettingsDialog = () => {
  const { isSettingsOpen, defaultTab, closeSettings } = useAISettings();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={closeSettings}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Assistant Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Provider Setup</h3>
              <AIProviderSettings />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Model Selection</h3>
              <AIModelSettings />
            </div>
          </TabsContent>
          
          <TabsContent value="provider" className="space-y-6 mt-6">
            <AIProviderSettings />
            <AIModelSettings />
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <AIConfigurationPanel />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsDialog;
