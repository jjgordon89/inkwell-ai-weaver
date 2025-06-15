
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import ProviderSelector from './ProviderSelector';
import ProviderDetails from './ProviderDetails';
import ApiKeyInput from './ApiKeyInput';

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
  
  const [providerJustChanged, setProviderJustChanged] = useState(false);

  // Debug logging to track state changes
  useEffect(() => {
    console.log('AIProviderSettings - selectedProvider changed:', selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    console.log('AIProviderSettings - apiKeys changed:', apiKeys);
  }, [apiKeys]);

  const handleProviderChange = (newProvider: string) => {
    console.log(`AIProviderSettings - Provider changing from ${selectedProvider} to ${newProvider}`);
    setSelectedProvider(newProvider);
    setProviderJustChanged(true);
    setTimeout(() => setProviderJustChanged(false), 2000);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(selectedProvider, key);
  };

  const handleTestConnection = () => {
    testConnection(selectedProvider);
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
        <ProviderSelector
          selectedProvider={selectedProvider}
          availableProviders={availableProviders}
          onProviderChange={handleProviderChange}
          providerJustChanged={providerJustChanged}
        />

        {/* Current Provider Details */}
        {currentProvider && (
          <div className="space-y-4">
            <ProviderDetails 
              provider={currentProvider}
              providerJustChanged={providerJustChanged}
            />

            {/* API Key Input */}
            {currentProvider.requiresApiKey && (
              <ApiKeyInput
                provider={currentProvider}
                apiKey={apiKeys[currentProvider.name] || ''}
                onApiKeyChange={handleApiKeyChange}
                onTestConnection={handleTestConnection}
                isTestingConnection={isTestingConnection}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIProviderSettings;
