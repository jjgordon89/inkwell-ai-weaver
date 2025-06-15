
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Globe, Server, Eye, EyeOff } from 'lucide-react';
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

  const getProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'OpenAI':
        return <Globe className="h-4 w-4" />;
      case 'Groq':
        return <Server className="h-4 w-4" />;
      case 'Local Model':
        return <Server className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const toggleApiKeyVisibility = (providerName: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [providerName]: !prev[providerName]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          AI Provider
        </CardTitle>
        <CardDescription>
          Choose your preferred AI provider for text processing and suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Selected Provider</label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
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

        {/* Provider Details */}
        {availableProviders.map((provider) => (
          provider.name === selectedProvider && (
            <div key={provider.name} className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                {getProviderIcon(provider.name)}
                <span className="font-medium">{provider.name}</span>
                {provider.requiresApiKey && (
                  <Badge variant="outline" className="text-xs">
                    <Key className="h-3 w-3 mr-1" />
                    API Key Required
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Available models: {provider.models.length}</p>
              </div>

              {/* API Key Input */}
              {provider.requiresApiKey && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey[provider.name] ? "text" : "password"}
                        placeholder={`Enter your ${provider.name} API key`}
                        value={apiKeys[provider.name] || ''}
                        onChange={(e) => setApiKey(provider.name, e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleApiKeyVisibility(provider.name)}
                      >
                        {showApiKey[provider.name] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(provider.name)}
                      disabled={!apiKeys[provider.name] || isTestingConnection}
                    >
                      {isTestingConnection ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                  {!apiKeys[provider.name] && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ This provider requires an API key to function
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
};

export default AIProviderSettings;
