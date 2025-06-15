
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Globe, Server, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIProviderSettings = () => {
  const { 
    selectedProvider, 
    setSelectedProvider, 
    availableProviders,
    apiKeys,
    setApiKey,
    testConnection,
    isTestingConnection
  } = useAI();
  
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [providerJustChanged, setProviderJustChanged] = useState(false);

  // Debug logging to track state changes
  useEffect(() => {
    console.log('AIProviderSettings - selectedProvider changed:', selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    console.log('AIProviderSettings - apiKeys changed:', apiKeys);
  }, [apiKeys]);

  const getProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'OpenAI':
        return <Globe className="h-4 w-4" />;
      case 'Groq':
        return <Server className="h-4 w-4 text-orange-500" />;
      case 'Local Model':
        return <Server className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getProviderDescription = (providerName: string) => {
    switch (providerName) {
      case 'OpenAI':
        return 'OpenAI\'s GPT models for high-quality text processing';
      case 'Groq':
        return 'Groq\'s fast inference engine with open-source models';
      case 'Local Model':
        return 'Run AI models locally on your machine';
      default:
        return 'AI language model provider';
    }
  };

  const getProviderSetupLink = (providerName: string) => {
    switch (providerName) {
      case 'OpenAI':
        return 'https://platform.openai.com/api-keys';
      case 'Groq':
        return 'https://console.groq.com/keys';
      default:
        return null;
    }
  };

  const handleProviderChange = (newProvider: string) => {
    console.log(`AIProviderSettings - Provider changing from ${selectedProvider} to ${newProvider}`);
    setSelectedProvider(newProvider);
    setProviderJustChanged(true);
    setTimeout(() => setProviderJustChanged(false), 2000);
  };

  const toggleApiKeyVisibility = (providerName: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [providerName]: !prev[providerName]
    }));
  };

  // Find current provider data
  const currentProvider = availableProviders.find(p => p.name === selectedProvider);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          AI Provider
          {providerJustChanged && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Changed
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Choose your preferred AI provider for text processing and suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Selected Provider</label>
          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger className={providerJustChanged ? "ring-2 ring-green-500 ring-offset-2" : ""}>
              <SelectValue placeholder="Select a provider">
                <div className="flex items-center gap-2">
                  {getProviderIcon(selectedProvider)}
                  {selectedProvider}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {availableProviders.map((provider) => (
                <SelectItem key={provider.name} value={provider.name}>
                  <div className="flex items-center gap-2">
                    {getProviderIcon(provider.name)}
                    {provider.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Provider Details */}
        {currentProvider && (
          <div className={`space-y-4 p-4 bg-muted/30 rounded-lg transition-all duration-300 ${
            providerJustChanged ? 'ring-2 ring-green-500 ring-offset-2 bg-green-50/50' : ''
          }`}>
            <div className="flex items-center gap-2">
              {getProviderIcon(currentProvider.name)}
              <span className="font-medium">{currentProvider.name}</span>
              {currentProvider.requiresApiKey && (
                <Badge variant="outline" className="text-xs">
                  <Key className="h-3 w-3 mr-1" />
                  API Key Required
                </Badge>
              )}
              {providerJustChanged && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                  Active
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{getProviderDescription(currentProvider.name)}</p>
              <p>Available models: {currentProvider.models.length}</p>
              <p className="text-xs">Models: {currentProvider.models.join(', ')}</p>
            </div>

            {/* API Key Input */}
            {currentProvider.requiresApiKey && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">API Key</label>
                  {getProviderSetupLink(currentProvider.name) && (
                    <a
                      href={getProviderSetupLink(currentProvider.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Get API Key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey[currentProvider.name] ? "text" : "password"}
                      placeholder={`Enter your ${currentProvider.name} API key`}
                      value={apiKeys[currentProvider.name] || ''}
                      onChange={(e) => setApiKey(currentProvider.name, e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => toggleApiKeyVisibility(currentProvider.name)}
                    >
                      {showApiKey[currentProvider.name] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(currentProvider.name)}
                    disabled={!apiKeys[currentProvider.name] || isTestingConnection}
                  >
                    {isTestingConnection ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                {!apiKeys[currentProvider.name] && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ This provider requires an API key to function
                  </p>
                )}
                {currentProvider.name === 'Groq' && (
                  <p className="text-xs text-muted-foreground">
                    💡 Groq offers fast inference with open-source models like Llama and Mixtral
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIProviderSettings;
