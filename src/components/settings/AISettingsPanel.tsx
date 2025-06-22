
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from 'lucide-react';
import AIProviderSettings from '@/components/sections/ai-assistance/AIProviderSettings';
import AIModelSettings from '@/components/sections/ai-assistance/AIModelSettings';
import AIConfigurationPanel from '@/components/sections/ai-assistance/AIConfigurationPanel';
import TestAIConfiguration from '@/components/sections/ai-assistance/TestAIConfiguration';
import ConfigurationStatus from '@/components/sections/ai-assistance/ConfigurationStatus';
import { useAI } from '@/hooks/useAI';

const AISettingsPanel = () => {
  const { 
    processText, 
    isProcessing, 
    isCurrentProviderConfigured,
    selectedProvider,
    selectedModel
  } = useAI();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI providers, models, and preferences for writing assistance.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ConfigurationStatus
            isCurrentProviderConfigured={isCurrentProviderConfigured}
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
          />
          <AIProviderSettings />
          <AIModelSettings />
        </div>
        
        <div className="space-y-6">
          <AIConfigurationPanel />
          <TestAIConfiguration
            processText={processText}
            isProcessing={isProcessing}
            isCurrentProviderConfigured={isCurrentProviderConfigured}
          />
        </div>
      </div>
    </div>
  );
};

export default AISettingsPanel;
