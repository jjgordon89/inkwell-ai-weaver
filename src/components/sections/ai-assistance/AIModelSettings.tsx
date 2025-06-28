
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Crown, Clock } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIModelSettings = () => {
  const { 
    selectedProvider, 
    selectedModel, 
    setSelectedModel, 
    availableProviders 
  } = useAI();

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('gpt-4') || modelName.includes('claude-opus') || modelName.includes('o3')) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    if (modelName.includes('turbo') || modelName.includes('haiku') || modelName.includes('mini')) {
      return <Zap className="h-4 w-4 text-blue-500" />;
    }
    return <Brain className="h-4 w-4 text-gray-500" />;
  };

  const getModelBadge = (modelName: string) => {
    if (modelName.includes('gpt-4.1') || modelName.includes('claude-opus-4') || modelName.includes('o3')) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Premium</Badge>;
    }
    if (modelName.includes('turbo') || modelName.includes('haiku') || modelName.includes('mini')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Fast</Badge>;
    }
    return <Badge variant="outline">Standard</Badge>;
  };

  const getModelDescription = (modelName: string) => {
    if (modelName.includes('gpt-4.1')) return 'OpenAI\'s flagship model with superior performance';
    if (modelName.includes('o3')) return 'Advanced reasoning model for complex problems';
    if (modelName.includes('o4-mini')) return 'Fast reasoning model optimized for efficiency';
    if (modelName.includes('claude-opus-4')) return 'Anthropic\'s most capable model with superior reasoning';
    if (modelName.includes('claude-sonnet-4')) return 'High-performance model with exceptional reasoning';
    if (modelName.includes('haiku')) return 'Fastest Claude model for quick responses';
    if (modelName.includes('gemini-pro')) return 'Google\'s multimodal AI model';
    if (modelName.includes('llama')) return 'Meta\'s open-source language model';
    if (modelName.includes('mixtral')) return 'Mistral\'s mixture of experts model';
    return 'AI language model for text generation and analysis';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Model Selection
        </CardTitle>
        <CardDescription>
          Choose the AI model that best fits your writing needs and performance requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Model</label>
          <Select 
            value={selectedModel} 
            onValueChange={setSelectedModel}
            disabled={availableModels.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model">
                {selectedModel && (
                  <div className="flex items-center gap-2">
                    {getModelIcon(selectedModel)}
                    {selectedModel}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model)}
                      <span>{model}</span>
                    </div>
                    {getModelBadge(model)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModel && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                {getModelIcon(selectedModel)}
                {selectedModel}
              </h4>
              {getModelBadge(selectedModel)}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {getModelDescription(selectedModel)}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Provider: {selectedProvider}</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>Type: {currentProvider?.type || 'cloud'}</span>
              </div>
            </div>
          </div>
        )}

        {availableModels.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No models available for the selected provider.</p>
            <p className="text-xs">Please select a provider first or check your connection.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelSettings;
