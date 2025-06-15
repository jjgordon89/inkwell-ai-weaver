
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Lightbulb, AlertCircle, Wand2 } from 'lucide-react';
import { useStoryArcAI } from '@/hooks/useStoryArcAI';
import { useAI } from '@/hooks/useAI';
import { StoryArc } from '@/contexts/WritingContext';

interface AIStoryArcGeneratorProps {
  onStoryArcGenerated: (storyArc: Partial<StoryArc>) => void;
  currentArcs: StoryArc[];
}

const AIStoryArcGenerator = ({ onStoryArcGenerated, currentArcs }: AIStoryArcGeneratorProps) => {
  const { generateStoryArc, improveSuggestions, isGenerating } = useStoryArcAI();
  const { isCurrentProviderConfigured } = useAI();
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setError(null);
    try {
      const generatedArc = await generateStoryArc(prompt);
      onStoryArcGenerated(generatedArc);
      setPrompt('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate story arc');
    }
  };

  const handleGetSuggestions = async () => {
    setError(null);
    try {
      const newSuggestions = await improveSuggestions(currentArcs);
      setSuggestions(newSuggestions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate suggestions');
    }
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
            AI Story Arc Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please configure your AI provider in the AI Assistance settings to use story arc generation.
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
          AI Story Arc Generator
        </CardTitle>
        <CardDescription>
          Generate story arcs with AI or get suggestions to improve your narrative structure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Describe the story arc you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
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

          {currentArcs.length > 0 && (
            <Button
              variant="outline"
              onClick={handleGetSuggestions}
              disabled={isGenerating}
              className="w-full"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Get Improvement Suggestions
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

export default AIStoryArcGenerator;
