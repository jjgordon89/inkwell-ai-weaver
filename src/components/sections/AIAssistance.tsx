
import React from 'react';
import { Settings, Brain, Zap, TestTube, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import AIProviderSettings from './ai-assistance/AIProviderSettings';
import AIModelSettings from './ai-assistance/AIModelSettings';
import AIConfigurationPanel from './ai-assistance/AIConfigurationPanel';
import LocalModelTester from '../ai/LocalModelTester';
import ContinueWritingButton from '../editor/ContinueWritingButton';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AIAssistance = () => {
  const { 
    selectedProvider, 
    selectedModel, 
    isProcessing, 
    isCurrentProviderConfigured,
    error,
    clearError
  } = useAI();

  const isConfigured = isCurrentProviderConfigured();

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
          {isConfigured ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Ready
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Setup Required
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 flex-grow overflow-auto">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
              <button 
                onClick={clearError}
                className="text-sm underline hover:no-underline ml-4"
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Start Guide */}
        {!isConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Getting Started:</strong> Configure an AI provider below to enable writing assistance features.
              Start with OpenAI or try a local model like Ollama for privacy.
            </AlertDescription>
          </Alert>
        )}

        {/* Continue Writing Feature */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Writing Assistant</h3>
          </div>
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Continue Writing</h4>
              {isConfigured && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Ready
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isConfigured 
                ? "Let AI continue your story from where you left off" 
                : "Configure an AI provider below to enable writing assistance"}
            </p>
            <ContinueWritingButton disabled={!isConfigured} />
          </div>
        </div>

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
            <h3 className="text-lg font-semibold">Connection Testing</h3>
          </div>
          <LocalModelTester />
        </div>

        {/* Current Configuration Summary */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-3">Current Configuration</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="font-medium">{selectedProvider || 'None selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">{selectedModel || 'None selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${
                isProcessing ? 'text-blue-600' : 
                isConfigured ? 'text-green-600' : 
                'text-amber-600'
              }`}>
                {isProcessing ? 'Processing' : isConfigured ? 'Ready' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistance;
