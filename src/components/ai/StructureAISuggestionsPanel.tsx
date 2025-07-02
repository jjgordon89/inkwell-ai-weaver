import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronRight, Lightbulb, RefreshCw } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useStructureAI } from '@/hooks/ai/useStructureAI';

interface StructureAISuggestionsPanelProps {
  structureType: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
  documentContent: string;
  onApplySuggestion: (text: string) => void;
}

export function StructureAISuggestionsPanel({
  structureType,
  documentContent,
  onApplySuggestion
}: StructureAISuggestionsPanelProps) {
  const { isProcessing, isCurrentProviderConfigured } = useAI();
  const { processStructureSpecificText } = useStructureAI();
  const { toast } = useToast();
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Get appropriate suggestions action based on structure type
  const getSuggestionsAction = () => {
    switch (structureType) {
      case 'academic':
        return 'academic-research-question';
      case 'memoir':
        return 'memoir-reflection';
      case 'nonfiction':
        return 'nonfiction-outline';
      case 'novel':
        return 'generate-plot';
      case 'screenplay':
        return 'continue-story';
      case 'poetry':
        return 'writing-prompt';
      case 'research':
        return 'academic-research-question';
      default:
        return 'context-suggestion';
    }
  };

  // Get structure-specific title
  const getSuggestionsTitle = () => {
    switch (structureType) {
      case 'academic':
        return 'Research Questions';
      case 'memoir':
        return 'Reflection Ideas';
      case 'nonfiction':
        return 'Structure Suggestions';
      case 'novel':
        return 'Plot Suggestions';
      case 'screenplay':
        return 'Scene Ideas';
      case 'poetry':
        return 'Poetic Inspiration';
      case 'research':
        return 'Research Directions';
      default:
        return 'AI Suggestions';
    }
  };

  const generateSuggestions = async () => {
    if (!isCurrentProviderConfigured()) {
      toast({
        title: "AI provider not configured",
        description: "Please configure your AI provider in the settings.",
        variant: "destructive"
      });
      return;
    }

    if (!documentContent.trim()) {
      toast({
        title: "No content available",
        description: "Please add some content to your document first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      // Extract a representative sample if the content is very long
      const sample = documentContent.length > 2000 
        ? documentContent.substring(0, 1000) + "..." + documentContent.substring(documentContent.length - 1000)
        : documentContent;
      
      const result = await processStructureSpecificText(
        sample, 
        getSuggestionsAction()
      );
      
      // Parse the results into individual suggestions
      const parsedSuggestions = result
        .split('\n')
        .filter(line => line.trim().length > 0)
        // Remove numbered lists (1., 2., etc.)
        .map(line => line.replace(/^\d+\.\s+/, ''))
        .filter(line => line.length > 15); // Filter out very short lines

      setSuggestions(parsedSuggestions);
      setAnalyzed(true);
      
      toast({
        title: "Suggestions generated",
        description: "AI has analyzed your document and generated suggestions."
      });
    } catch (error) {
      toast({
        title: "Failed to generate suggestions",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>{getSuggestionsTitle()}</span>
        </CardTitle>
        <CardDescription>
          AI-powered suggestions for your {structureType} document
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!analyzed && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Generate structure-specific suggestions based on your document content
            </p>
            <Button onClick={generateSuggestions} disabled={isProcessing}>
              Analyze Document
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-[40px] w-full" />
            <Skeleton className="h-[40px] w-full" />
            <Skeleton className="h-[40px] w-full" />
            <Skeleton className="h-[40px] w-full" />
          </div>
        )}

        {analyzed && !loading && (
          <div className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-md hover:bg-accent transition-colors group relative"
                >
                  <p className="pr-8">{suggestion}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onApplySuggestion(suggestion)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No specific suggestions generated. Try adding more content to your document.
              </p>
            )}
          </div>
        )}
      </CardContent>
      
      {analyzed && !loading && (
        <CardFooter className="flex justify-between">
          <div>
            <Badge variant="outline" className="mr-2">
              {structureType}
            </Badge>
            <Badge variant="outline">
              {suggestions.length} suggestions
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateSuggestions}
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
