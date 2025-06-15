
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Cpu, Zap, RefreshCw } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIModelSettings = () => {
  const { selectedProvider, selectedModel, setSelectedModel, availableProviders } = useAI();
  const [modelJustChanged, setModelJustChanged] = useState(false);

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const availableModels = currentProvider?.models || [];

  // Debug logging
  useEffect(() => {
    console.log('AIModelSettings - selectedProvider changed:', selectedProvider);
    console.log('AIModelSettings - currentProvider:', currentProvider);
    console.log('AIModelSettings - availableModels:', availableModels);
  }, [selectedProvider, currentProvider, availableModels]);

  useEffect(() => {
    console.log('AIModelSettings - selectedModel changed:', selectedModel);
  }, [selectedModel]);

  // Reset model selection when provider changes and current model is not available
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.includes(selectedModel)) {
      console.log(`AIModelSettings - Auto-switching model to ${availableModels[0]} for provider ${selectedProvider}`);
      setSelectedModel(availableModels[0]);
      setModelJustChanged(true);
      setTimeout(() => setModelJustChanged(false), 2000);
    }
  }, [selectedProvider, availableModels, selectedModel, setSelectedModel]);

  const handleModelChange = (newModel: string) => {
    console.log(`AIModelSettings - Model changing from ${selectedModel} to ${newModel}`);
    setSelectedModel(newModel);
    setModelJustChanged(true);
    setTimeout(() => setModelJustChanged(false), 2000);
  };

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('gpt-4')) return <Brain className="h-4 w-4 text-purple-500" />;
    if (modelName.includes('gpt-3.5')) return <Cpu className="h-4 w-4 text-blue-500" />;
    if (modelName.includes('gemini-1.5-pro')) return <Brain className="h-4 w-4 text-blue-600" />;
    if (modelName.includes('gemini-1.5-flash')) return <Zap className="h-4 w-4 text-blue-500" />;
    if (modelName.includes('gemini-1.0-pro')) return <Brain className="h-4 w-4 text-blue-400" />;
    if (modelName.includes('llama')) return <Zap className="h-4 w-4 text-green-500" />;
    if (modelName.includes('mixtral')) return <Brain className="h-4 w-4 text-orange-500" />;
    if (modelName.includes('gemma')) return <Brain className="h-4 w-4 text-red-500" />;
    if (modelName.includes('mistral')) return <Brain className="h-4 w-4 text-indigo-500" />;
    return <Brain className="h-4 w-4" />;
  };

  const getModelDescription = (modelName: string) => {
    if (modelName.includes('gpt-4')) return 'Advanced reasoning and complex tasks';
    if (modelName.includes('gpt-3.5')) return 'Fast and efficient for most tasks';
    if (modelName.includes('gemini-1.5-pro')) return 'Google\'s most capable multimodal model';
    if (modelName.includes('gemini-1.5-flash')) return 'Fast and efficient multimodal model';
    if (modelName.includes('gemini-1.0-pro')) return 'Google\'s foundational language model';
    if (modelName.includes('llama-3.3-70b')) return 'Latest Llama model with enhanced capabilities';
    if (modelName.includes('llama-3.1-70b')) return 'Large Llama model with strong performance';
    if (modelName.includes('llama-3.1-8b')) return 'Fast and efficient Llama model';
    if (modelName.includes('llama3-70b')) return 'Large model with strong performance';
    if (modelName.includes('llama3-8b')) return 'Compact but capable model';
    if (modelName.includes('mixtral')) return 'Mixture of experts model';
    if (modelName.includes('gemma2-9b')) return 'Google\'s latest efficient language model';
    if (modelName.includes('gemma-7b')) return 'Google\'s efficient language model';
    if (modelName.includes('mistral')) return 'High-performance open model';
    return 'AI language model';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Model Selection
          {modelJustChanged && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <RefreshCw className="h-3 w-3 mr-1" />
              Updated
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Choose the specific AI model to use with {selectedProvider}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Available Models</label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className={modelJustChanged ? "ring-2 ring-blue-500 ring-offset-2" : ""}>
              <SelectValue placeholder="Select a model">
                {selectedModel && (
                  <div className="flex items-center gap-2">
                    {getModelIcon(selectedModel)}
                    {selectedModel}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
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
        {selectedModel && availableModels.includes(selectedModel) && (
          <div className={`space-y-3 p-3 bg-muted/30 rounded-lg transition-all duration-300 ${
            modelJustChanged ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50' : ''
          }`}>
            <div className="flex items-center gap-2">
              {getModelIcon(selectedModel)}
              <span className="font-medium">{selectedModel}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedProvider}
              </Badge>
              {modelJustChanged && (
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                  Selected
                </Badge>
              )}
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
