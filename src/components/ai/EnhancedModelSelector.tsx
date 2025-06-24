import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Clock, Star, Search, Filter } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface ModelInfo {
  id: string;
  name: string;
  category: 'general' | 'creative' | 'analytical' | 'fast' | 'specialized';
  performance: 'high' | 'medium' | 'low';
  speed: 'fast' | 'medium' | 'slow';
  contextSize?: string;
  description?: string;
}

const modelDatabase: Record<string, ModelInfo[]> = {
  'OpenAI': [
    { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 Turbo', category: 'general', performance: 'high', speed: 'fast', contextSize: '128K', description: 'Latest flagship model with superior reasoning' },
    { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini', category: 'fast', performance: 'medium', speed: 'fast', contextSize: '128K', description: 'Efficient model for quick tasks' },
    { id: 'o3-2025-04-16', name: 'O3', category: 'analytical', performance: 'high', speed: 'slow', contextSize: '200K', description: 'Advanced reasoning for complex problems' },
    { id: 'o4-mini-2025-04-16', name: 'O4 Mini', category: 'fast', performance: 'medium', speed: 'fast', contextSize: '128K', description: 'Fast reasoning model' }
  ],
  'Google Gemini': [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'general', performance: 'high', speed: 'medium', contextSize: '2M', description: 'Long context understanding' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'fast', performance: 'medium', speed: 'fast', contextSize: '1M', description: 'Fast multimodal model' }
  ],
  'Anthropic Claude': [
    { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus', category: 'creative', performance: 'high', speed: 'medium', contextSize: '200K', description: 'Most capable creative writing' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet', category: 'general', performance: 'high', speed: 'fast', contextSize: '200K', description: 'Balanced performance and efficiency' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', category: 'fast', performance: 'medium', speed: 'fast', contextSize: '200K', description: 'Fastest model for quick responses' }
  ]
};

const EnhancedModelSelector = () => {
  const { selectedProvider, selectedModel, setSelectedModel, availableProviders } = useAI();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const currentProviderModels = useMemo(() => {
    const provider = availableProviders.find(p => p.name === selectedProvider);
    if (!provider) return [];

    const dbModels = modelDatabase[selectedProvider] || [];
    return provider.models.map((modelId: string) => {
      const modelInfo = dbModels.find(m => m.id === modelId);
      return modelInfo || {
        id: modelId,
        name: modelId,
        category: 'general' as const,
        performance: 'medium' as const,
        speed: 'medium' as const
      };
    });
  }, [selectedProvider, availableProviders]);

  const filteredModels = useMemo(() => {
    return currentProviderModels.filter((model: ModelInfo) => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          model.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || model.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [currentProviderModels, searchTerm, categoryFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'creative': return <Star className="h-3 w-3" />;
      case 'analytical': return <Brain className="h-3 w-3" />;
      case 'fast': return <Zap className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  const getPerformanceBadge = (performance: string, speed: string) => {
    if (performance === 'high' && speed === 'fast') {
      return <Badge variant="default" className="text-xs">Premium</Badge>;
    }
    if (performance === 'high') {
      return <Badge variant="secondary" className="text-xs">High Quality</Badge>;
    }
    if (speed === 'fast') {
      return <Badge variant="outline" className="text-xs">Fast</Badge>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Enhanced Model Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="model-search" className="sr-only">Search models</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="model-search"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="analytical">Analytical</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model Grid */}
        <div className="grid gap-3 max-h-64 overflow-y-auto">
          {filteredModels.map((model: ModelInfo) => (
            <div
              key={model.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedModel === model.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(model.category)}
                    <span className="font-medium text-sm">{model.name}</span>
                    {getPerformanceBadge(model.performance, model.speed)}
                  </div>
                  {model.description && (
                    <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {model.speed}
                    </div>
                    {model.contextSize && (
                      <div>Context: {model.contextSize}</div>
                    )}
                  </div>
                </div>
                {selectedModel === model.id && (
                  <div className="h-2 w-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No models found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedModelSelector;
