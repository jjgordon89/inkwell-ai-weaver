
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Cpu, Zap } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIModelSettings = () => {
  const { selectedProvider, selectedModel, setSelectedModel, availableProviders } = useAI();

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('gpt-4')) return <Brain className="h-4 w-4 text-purple-500" />;
    if (modelName.includes('gpt-3.5')) return <Cpu className="h-4 w-4 text-blue-500" />;
    if (modelName.includes('llama')) return <Zap className="h-4 w-4 text-green-500" />;
    if (modelName.includes('mixtral')) return <Brain className="h-4 w-4 text-orange-500" />;
    return <Brain className="h-4 w-4" />;
  };

  const getModelDescription = (modelName: string) => {
    if (modelName.includes('gpt-4')) return 'Advanced reasoning and complex tasks';
    if (modelName.includes('gpt-3.5')) return 'Fast and efficient for most tasks';
    if (modelName.includes('llama2-70b')) return 'Large model with strong performance';
    if (modelName.includes('mixtral')) return 'Mixture of experts model';
    if (modelName.includes('llama-7b')) return 'Compact model for basic tasks';
    if (modelName.includes('codellama')) return 'Specialized for code generation';
    return 'AI language model';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Model Selection
        </CardTitle>
        <CardDescription>
          Choose the specific AI model to use with {selectedProvider}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Available Models</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  <div className="flex items-center gap-2">
                    {getModelIcon(model)}
                    {model}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Details */}
        {selectedModel && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              {getModelIcon(selectedModel)}
              <span className="font-medium">{selectedModel}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedProvider}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getModelDescription(selectedModel)}
            </p>
          </div>
        )}

        {availableModels.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No models available for the selected provider.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelSettings;
