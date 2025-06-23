import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, TestTube, Globe, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const CustomEndpointConfig = () => {
  const { 
    selectedProvider, 
    apiKeys, 
    setApiKey, 
    testConnection, 
    isTestingConnection 
  } = useAI();
  
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [newModel, setNewModel] = useState('');
  const [apiKey, setApiKeyLocal] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error' | 'warning'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Load saved custom configuration
  useEffect(() => {
    if (selectedProvider === 'Custom OpenAI Compatible') {
      const savedEndpoint = localStorage.getItem('custom-openai-endpoint');
      const savedModels = localStorage.getItem('custom-openai-models');
      const savedApiKey = apiKeys['Custom OpenAI Compatible'] || '';
      
      if (savedEndpoint) setCustomEndpoint(savedEndpoint);
      if (savedModels) setCustomModels(JSON.parse(savedModels));
      setApiKeyLocal(savedApiKey);
    }
  }, [selectedProvider, apiKeys]);

  // Save configuration to localStorage
  const saveConfiguration = () => {
    localStorage.setItem('custom-openai-endpoint', customEndpoint);
    localStorage.setItem('custom-openai-models', JSON.stringify(customModels));
    setApiKey('Custom OpenAI Compatible', apiKey);
  };

  const addModel = () => {
    if (newModel.trim() && !customModels.includes(newModel.trim())) {
      const updatedModels = [...customModels, newModel.trim()];
      setCustomModels(updatedModels);
      setNewModel('');
      localStorage.setItem('custom-openai-models', JSON.stringify(updatedModels));
    }
  };

  const removeModel = (modelToRemove: string) => {
    const updatedModels = customModels.filter(model => model !== modelToRemove);
    setCustomModels(updatedModels);
    localStorage.setItem('custom-openai-models', JSON.stringify(updatedModels));
  };

  const handleTestConnection = async () => {
    if (!customEndpoint || !apiKey) {
      setConnectionStatus('error');
      setStatusMessage('Please configure both endpoint URL and API key');
      return;
    }

    if (customModels.length === 0) {
      setConnectionStatus('error');
      setStatusMessage('Please add at least one model');
      return;
    }

    setConnectionStatus('testing');
    setStatusMessage('Testing connection...');
    
    try {
      const success = await testConnection('Custom OpenAI Compatible');
      if (success) {
        setConnectionStatus('success');
        setStatusMessage('Connection successful! Your custom endpoint is working correctly.');
      } else {
        setConnectionStatus('warning');
        setStatusMessage('Connection test failed, but this might be due to browser CORS restrictions. The endpoint may still work for actual API calls.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage('Connection failed. Please check your endpoint URL and API key.');
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKeyLocal(value);
    setApiKey('Custom OpenAI Compatible', value);
  };

  if (selectedProvider !== 'Custom OpenAI Compatible') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Custom OpenAI Compatible Endpoint
        </CardTitle>
        <CardDescription>
          Configure your custom OpenAI-compatible API endpoint, models, and authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Configuration */}
        <div className="space-y-2">
          <Label htmlFor="custom-api-key" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Key
          </Label>
          <Input
            id="custom-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Enter your API key"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Your API key for authenticating with the custom endpoint
          </p>
        </div>

        {/* Endpoint Configuration */}
        <div className="space-y-2">
          <Label htmlFor="custom-endpoint">API Endpoint URL</Label>
          <Input
            id="custom-endpoint"
            type="url"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            placeholder="https://api.example.com/v1/chat/completions"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            The full URL to your OpenAI-compatible chat completions endpoint
          </p>
        </div>

        {/* Models Configuration */}
        <div className="space-y-3">
          <Label>Available Models</Label>
          <div className="flex gap-2">
            <Input
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Enter model name (e.g., llama-3.1-70b)"
              className="font-mono"
              onKeyPress={(e) => e.key === 'Enter' && addModel()}
            />
            <Button onClick={addModel} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {customModels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customModels.map((model) => (
                <Badge key={model} variant="secondary" className="flex items-center gap-1">
                  {model}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeModel(model)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Add the model names that are available on your endpoint
          </p>
        </div>

        {/* Test Connection */}
        <div className="space-y-3">
          <Button 
            onClick={handleTestConnection}
            disabled={!customEndpoint || !apiKey || customModels.length === 0 || isTestingConnection}
            className="w-full"
            variant={connectionStatus === 'success' ? 'default' : 'outline'}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>

          {connectionStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'warning' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Additional info for CORS issues */}
          {connectionStatus === 'warning' && (
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Note about browser limitations:</p>
              <p>Many custom API endpoints have CORS restrictions that prevent direct testing from the browser. This doesn't mean your endpoint won't work - it's just a security limitation of web browsers.</p>
            </div>
          )}
        </div>

        {/* Save Configuration */}
        <Button 
          onClick={saveConfiguration}
          className="w-full"
          disabled={!customEndpoint || !apiKey}
        >
          Save Configuration
        </Button>

        {/* Usage Examples */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Example Endpoints:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <code>https://api.together.xyz/v1/chat/completions</code></li>
            <li>• <code>https://api.fireworks.ai/inference/v1/chat/completions</code></li>
            <li>• <code>https://your-server.com/v1/chat/completions</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomEndpointConfig;
