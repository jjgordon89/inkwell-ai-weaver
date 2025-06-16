import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bot, 
  Globe, 
  Brain, 
  Sliders, 
  TestTube,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  X,
  Database
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import AIProviderSettings from '../sections/ai-assistance/AIProviderSettings';
import AIModelSettings from '../sections/ai-assistance/AIModelSettings';
import GeneralSettings from '../sections/ai-assistance/GeneralSettings';
import AdvancedParameters from '../sections/ai-assistance/AdvancedParameters';
import TestAIConfiguration from '../sections/ai-assistance/TestAIConfiguration';
import ConfigurationStatus from '../sections/ai-assistance/ConfigurationStatus';
import DatabaseSettings from '../settings/DatabaseSettings';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "overview"
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [settings, setSettings] = useState({
    autoSuggest: true,
    realTimeProcessing: false,
    maxTokens: '1000',
    temperature: '0.7'
  });

  const { 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured,
    isProcessing,
    processText
  } = useAI();

  const isConfigured = isCurrentProviderConfigured();

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('ai-settings', JSON.stringify(settings));
    onClose();
  };

  const handleResetSettings = () => {
    setSettings({
      autoSuggest: true,
      realTimeProcessing: false,
      maxTokens: '1000',
      temperature: '0.7'
    });
  };

  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Settings & Configuration
              {isConfigured ? (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Setup Required
                </Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">            <TabsList className="grid w-full grid-cols-7 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="provider" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Provider</span>
              </TabsTrigger>
              <TabsTrigger value="model" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Model</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Database</span>
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span className="hidden sm:inline">Test</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfigurationStatus 
                  isCurrentProviderConfigured={isCurrentProviderConfigured} 
                  selectedProvider={selectedProvider} 
                  selectedModel={selectedModel} 
                />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('provider')}
                      className="justify-start"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Configure Provider
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('model')}
                      className="justify-start"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Select Model
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('test')}
                      className="justify-start"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Configuration
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('advanced')}
                      className="justify-start"
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                </div>
              </div>

              {!isConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Setup Required</span>
                  </div>
                  <p className="text-sm text-amber-700 mb-3">
                    Your AI provider needs to be configured before you can use AI features.
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => setActiveTab('provider')}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Configure Now
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="provider">
              <AIProviderSettings />
            </TabsContent>

            <TabsContent value="model">
              <AIModelSettings />
            </TabsContent>

            <TabsContent value="general">
              <GeneralSettings
                autoSuggest={settings.autoSuggest}
                setAutoSuggest={(value) => setSettings(prev => ({ ...prev, autoSuggest: value }))}
                realTimeProcessing={settings.realTimeProcessing}
                setRealTimeProcessing={(value) => setSettings(prev => ({ ...prev, realTimeProcessing: value }))}
              />
            </TabsContent>

            <TabsContent value="advanced">              <AdvancedParameters
                maxTokens={settings.maxTokens}
                setMaxTokens={(value) => setSettings(prev => ({ ...prev, maxTokens: value }))}
                temperature={settings.temperature}
                setTemperature={(value) => setSettings(prev => ({ ...prev, temperature: value }))}
              />
            </TabsContent>

            <TabsContent value="database">
              <DatabaseSettings />
            </TabsContent>

            <TabsContent value="test">
              <TestAIConfiguration
                processText={processText}
                isProcessing={isProcessing}
                isCurrentProviderConfigured={isCurrentProviderConfigured}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Provider: {selectedProvider}</span>
            <span>•</span>
            <span>Model: {selectedModel}</span>
            <span>•</span>
            <span className={isConfigured ? "text-green-600" : "text-red-600"}>
              {isConfigured ? "Ready" : "Needs Setup"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsModal;
