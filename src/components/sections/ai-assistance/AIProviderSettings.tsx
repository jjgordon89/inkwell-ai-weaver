
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Key, Globe, Server } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIProviderSettings = () => {
  const { selectedProvider, setSelectedProvider, availableProviders } = useAI();

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
            <div key={provider.name} className="space-y-3 p-3 bg-muted/30 rounded-lg">
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
                {provider.requiresApiKey && (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠️ This provider requires an API key to function
                  </p>
                )}
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
};

export default AIProviderSettings;
