
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const CustomEndpointConfig = () => {
  const { getCurrentProviderInfo } = useAI();
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customModels, setCustomModels] = useState<string[]>(['']);
  const [newModel, setNewModel] = useState('');

  const currentProvider = getCurrentProviderInfo();
  const isCustomProvider = currentProvider?.customEndpoint;

  if (!isCustomProvider) return null;

  const addModel = () => {
    if (newModel.trim() && !customModels.includes(newModel.trim())) {
      setCustomModels([...customModels.filter(m => m.trim()), newModel.trim()]);
      setNewModel('');
    }
  };

  const removeModel = (index: number) => {
    setCustomModels(customModels.filter((_, i) => i !== index));
  };

  const updateModel = (index: number, value: string) => {
    const updated = [...customModels];
    updated[index] = value;
    setCustomModels(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Custom OpenAI Compatible Endpoint
        </CardTitle>
        <CardDescription>
          Configure a custom OpenAI-compatible API endpoint and models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="endpoint">API Endpoint URL</Label>
          <Input
            id="endpoint"
            placeholder="https://api.your-provider.com/v1/chat/completions"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Must be an OpenAI-compatible endpoint (e.g., /v1/chat/completions)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Available Models</Label>
          <div className="space-y-2">
            {customModels.map((model, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="model-name"
                  value={model}
                  onChange={(e) => updateModel(index, e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeModel(index)}
                  disabled={customModels.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add new model"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addModel()}
            />
            <Button onClick={addModel} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Badge variant="outline">
            OpenAI Compatible
          </Badge>
          <span className="text-sm text-muted-foreground">
            Works with providers like Ollama, LM Studio, vLLM, and others
          </span>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Examples of compatible providers:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Self-hosted Ollama with OpenAI compatibility</li>
            <li>vLLM servers</li>
            <li>Text Generation Inference (TGI)</li>
            <li>Custom OpenAI proxy servers</li>
            <li>LocalAI installations</li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          <a 
            href="https://github.com/ollama/ollama/blob/main/docs/openai.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Ollama OpenAI Compatibility Guide
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomEndpointConfig;
