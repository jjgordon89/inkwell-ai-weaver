
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useToast } from "@/hooks/use-toast";

interface AIConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfigurationModal: React.FC<AIConfigurationModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedProvider, 
    selectedModel, 
    availableProviders, 
    apiKeys,
    setSelectedProvider, 
    setSelectedModel, 
    setApiKey,
    testConnection,
    isTestingConnection,
    isCurrentProviderConfigured
  } = useAI();
  
  const { toast } = useToast();
  const [tempApiKey, setTempApiKey] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const currentApiKey = apiKeys[selectedProvider] || '';

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    setTestResult(null);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setTestResult(null);
  };

  const handleApiKeySubmit = () => {
    if (tempApiKey.trim()) {
      setApiKey(selectedProvider, tempApiKey.trim());
      setTempApiKey('');
      setTestResult(null);
      toast({
        title: "API Key Saved",
        description: `API key for ${selectedProvider} has been saved.`,
      });
    }
  };

  const handleTestConnection = async () => {
    const result = await testConnection(selectedProvider);
    setTestResult(result); // This now correctly passes a boolean
    
    if (result) {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${selectedProvider}`,
      });
    } else {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${selectedProvider}. Please check your settings.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider and model settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.name} value={provider.name}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          {currentProvider && (
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider.models.map((model: string) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* API Key Input */}
          {currentProvider?.requiresApiKey && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={currentApiKey ? "••••••••••••" : "Enter your API key"}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                />
                <Button 
                  onClick={handleApiKeySubmit}
                  disabled={!tempApiKey.trim()}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Configuration Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm">Configuration Status</span>
            <Badge variant={isCurrentProviderConfigured() ? "default" : "secondary"}>
              {isCurrentProviderConfigured() ? "Ready" : "Needs Setup"}
            </Badge>
          </div>

          {/* Test Connection */}
          <div className="space-y-2">
            <Button
              onClick={handleTestConnection}
              disabled={!isCurrentProviderConfigured() || isTestingConnection}
              className="w-full"
              variant="outline"
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  {testResult === true && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                  {testResult === false && <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                </>
              )}
              Test Connection
            </Button>
            
            {testResult !== null && (
              <Alert variant={testResult ? "default" : "destructive"}>
                <AlertDescription>
                  {testResult 
                    ? `Successfully connected to ${selectedProvider}` 
                    : `Connection failed. Please check your API key and settings.`
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigurationModal;
