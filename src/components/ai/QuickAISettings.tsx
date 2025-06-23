import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Settings, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Key
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickAISettingsProps {
  showLabel?: boolean;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "lg" | "default" | "icon";
}

const QuickAISettings: React.FC<QuickAISettingsProps> = ({ 
  showLabel = true,
  variant = "ghost",
  size = "sm"
}) => {
  const { 
    selectedProvider, 
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    availableProviders,
    isCurrentProviderConfigured,
    apiKeys,
    setApiKey
  } = useAI();

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const isConfigured = isCurrentProviderConfigured();
  const availableModels = currentProvider?.models || [];

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    const provider = availableProviders.find(p => p.name === newProvider);
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0]);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Settings className="h-4 w-4" />
          {showLabel && "Quick AI Settings"}
          {!isConfigured ? (
            <Badge variant="destructive" className="text-xs px-1">
              <AlertCircle className="h-3 w-3" />
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs px-1">
              <CheckCircle2 className="h-3 w-3" />
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Bot className="h-4 w-4" />
            <h4 className="font-medium">Quick AI Settings</h4>
            {isConfigured ? (
              <Badge variant="secondary" className="ml-auto text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-auto text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Setup Needed
              </Badge>
            )}
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider-select">Provider</Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger id="provider-select">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.name} value={provider.name}>
                    <div className="flex items-center gap-2">
                      <span>{provider.name}</span>
                      {provider.requiresApiKey && !apiKeys[provider.name] && (
                        <Key className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model-select">Model</Label>
            <Select 
              value={selectedModel} 
              onValueChange={handleModelChange}
              disabled={availableModels.length === 0}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model: string) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key Input (if needed) */}
          {currentProvider?.requiresApiKey && (
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key for {selectedProvider}</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type="password"
                  value={apiKeys[selectedProvider] || ''}
                  onChange={(e) => setApiKey(selectedProvider, e.target.value)}
                  placeholder={`Enter ${selectedProvider} API key`}
                  className="pr-8"
                />
                <Key className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {!apiKeys[selectedProvider] && (
                <p className="text-xs text-amber-600">
                  API key required for {selectedProvider}
                </p>
              )}
            </div>
          )}

          {/* Status Info */}
          <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Provider:</span>
              <span>{selectedProvider}</span>
            </div>
            <div className="flex justify-between">
              <span>Model:</span>
              <span>{selectedModel}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isConfigured ? "text-green-600" : "text-red-600"}>
                {isConfigured ? "Ready" : "Needs Setup"}
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickAISettings;
