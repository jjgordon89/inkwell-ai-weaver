
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Lightbulb, AlertCircle, Wand2 } from 'lucide-react';
import { useWorldBuildingAI } from '@/hooks/useWorldBuildingAI';
import { useAI } from '@/hooks/useAI';
import { useAIErrorHandler } from '@/hooks/ai/useAIErrorHandler';
import { WorldElement } from '@/contexts/WritingContext';
import AIErrorBoundary from '@/components/ai/AIErrorBoundary';

interface AIWorldBuildingGeneratorProps {
  onWorldElementGenerated: (worldElement: Partial<WorldElement>) => void;
  currentElements: WorldElement[];
}

const AIWorldBuildingGeneratorContent = ({ onWorldElementGenerated, currentElements }: AIWorldBuildingGeneratorProps) => {
  const { generateWorldElement, improveSuggestions, isGenerating } = useWorldBuildingAI();
  const { isCurrentProviderConfigured } = useAI();
  const { error, clearError, retryWithErrorHandling } = useAIErrorHandler();
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<WorldElement['type']>('location');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const result = await retryWithErrorHandling(async () => {
      const generatedElement = await generateWorldElement(prompt, selectedType);
      onWorldElementGenerated(generatedElement);
      setPrompt('');
      return true;
    }, 'api');
  };

  const handleGetSuggestions = async () => {
    const result = await retryWithErrorHandling(async () => {
      const newSuggestions = await improveSuggestions(currentElements);
      setSuggestions(newSuggestions);
      return true;
    }, 'api');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setSuggestions([]);
  };

  if (!isCurrentProviderConfigured()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI World Building Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please configure your AI provider in the AI Assistance settings to use world building generation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI World Building Generator
        </CardTitle>
        <CardDescription>
          Generate world building elements with AI or get suggestions to enhance your world.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={(value: WorldElement['type']) => setSelectedType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="magic">Magic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Describe the ${selectedType} you want to create...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              className="flex-1"
            />
            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {currentElements.length > 0 && (
            <Button
              variant="outline"
              onClick={handleGetSuggestions}
              disabled={isGenerating}
              className="w-full"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Get World Building Suggestions
            </Button>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Suggestions:</h4>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AIWorldBuildingGenerator = (props: AIWorldBuildingGeneratorProps) => {
  return (
    <AIErrorBoundary>
      <AIWorldBuildingGeneratorContent {...props} />
    </AIErrorBoundary>
  );
};

export default AIWorldBuildingGenerator;
