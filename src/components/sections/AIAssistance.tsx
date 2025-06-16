
import React from 'react';
import { Settings, Brain, Zap, TestTube } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import AIProviderSettings from './ai-assistance/AIProviderSettings';
import AIModelSettings from './ai-assistance/AIModelSettings';
import AIConfigurationPanel from './ai-assistance/AIConfigurationPanel';
import LocalModelTester from '../ai/LocalModelTester';

const AIAssistance = () => {
  const { selectedProvider, selectedModel, isProcessing } = useAI();

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

      <div className="space-y-6 flex-grow overflow-auto">
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
        </div>        {/* Configuration Panel */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistance;
