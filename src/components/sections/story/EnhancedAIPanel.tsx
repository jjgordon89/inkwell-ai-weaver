
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  Wand2, 
  BarChart3, 
  BookOpen, 
  PenTool, 
  Loader2,
  Target,
  Zap
} from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { useToast } from "@/hooks/use-toast";
import { ToneAnalysis, PlotElement, WritingPrompt } from '@/hooks/ai/types';

const EnhancedAIPanel = () => {
  const { state } = useWriting();
  const { 
    generateContextualSuggestions,
    analyzeToneAndStyle,
    generatePlotElements,
    continueStory,
    generateWritingPrompt,
    isAnalyzing,
    isGenerating
  } = useEnhancedAI();
  
  const { toast } = useToast();
  
  const [contextSuggestions, setContextSuggestions] = useState<string[]>([]);
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [plotElements, setPlotElements] = useState<PlotElement[]>([]);
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([]);
  const [storyContinuation, setStoryContinuation] = useState<string>('');

  const handleContextSuggestions = async () => {
    if (!state.currentDocument) return;
    
    try {
      const suggestions = await generateContextualSuggestions(
        state.currentDocument.content,
        state.selectedText,
        state.characters,
        state.storyArcs
      );
      setContextSuggestions(suggestions);
      toast({
        title: "Context Analysis Complete",
        description: `Generated ${suggestions.length} contextual suggestions`,
      });
    } catch (error) {
      console.error('Failed to generate contextual suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate contextual suggestions.",
        variant: "destructive",
      });
    }
  };

  const handleToneAnalysis = async () => {
    const textToAnalyze = state.selectedText || state.currentDocument?.content;
    if (!textToAnalyze) return;
    
    try {
      const analysis = await analyzeToneAndStyle(textToAnalyze);
      setToneAnalysis(analysis);
      toast({
        title: "Tone Analysis Complete",
        description: `Detected ${analysis.tone} tone with ${analysis.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Failed to analyze tone:', error);
      toast({
        title: "Error",
        description: "Failed to analyze tone and style.",
        variant: "destructive",
      });
    }
  };

  const handlePlotGeneration = async () => {
    if (!state.currentDocument) return;
    
    try {
      const elements = await generatePlotElements(state.currentDocument.content);
      setPlotElements(elements);
      toast({
        title: "Plot Elements Generated",
        description: `Created ${elements.length} plot suggestions`,
      });
    } catch (error) {
      console.error('Failed to generate plot elements:', error);
      toast({
        title: "Error",
        description: "Failed to generate plot elements.",
        variant: "destructive",
      });
    }
  };

  const handleStoryContinuation = async () => {
    if (!state.currentDocument) return;
    
    try {
      const continuation = await continueStory(state.currentDocument.content);
      setStoryContinuation(continuation);
      toast({
        title: "Story Continuation Generated",
        description: "AI has generated a continuation for your story",
      });
    } catch (error) {
      console.error('Failed to continue story:', error);
      toast({
        title: "Error",
        description: "Failed to generate story continuation.",
        variant: "destructive",
      });
    }
  };

  const handleWritingPrompt = async () => {
    try {
      const prompt = await generateWritingPrompt('fiction', 'intermediate', 'theme');
      setWritingPrompts(prev => [prompt, ...prev].slice(0, 5));
      toast({
        title: "Writing Prompt Generated",
        description: `Created "${prompt.title}" writing exercise`,
      });
    } catch (error) {
      console.error('Failed to generate writing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate writing prompt.",
        variant: "destructive",
      });
    }
  };

  const isProcessing = isAnalyzing || isGenerating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Enhanced AI Writing Tools
        </CardTitle>
        <CardDescription>
          Advanced AI capabilities for contextual writing assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="context" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="plot">Plot</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="context" className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleContextSuggestions}
                disabled={isProcessing || !state.currentDocument}
                className="w-full"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                Generate Context-Aware Suggestions
              </Button>
              
              {contextSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Context-Aware Suggestions</h4>
                  {contextSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 border-l-2 border-blue-500/30"
                    >
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleToneAnalysis}
                disabled={isProcessing || (!state.selectedText && !state.currentDocument)}
                className="w-full"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Analyze Tone & Style
              </Button>
              
              {toneAnalysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{toneAnalysis.tone}</Badge>
                    <Badge variant="secondary">{toneAnalysis.confidence}% confidence</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Style Suggestions</h4>
                    {toneAnalysis.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {suggestion}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="plot" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handlePlotGeneration}
                  disabled={isProcessing || !state.currentDocument}
                  variant="outline"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Lightbulb className="h-3 w-3 mr-1" />
                  )}
                  Plot Elements
                </Button>
                <Button 
                  onClick={handleStoryContinuation}
                  disabled={isProcessing || !state.currentDocument}
                  variant="outline"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <BookOpen className="h-3 w-3 mr-1" />
                  )}
                  Continue Story
                </Button>
              </div>
              
              {plotElements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Plot Suggestions</h4>
                  {plotElements.map((element, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 border-l-2 border-green-500/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{element.type}</Badge>
                        <Badge variant="secondary" className="text-xs">{element.placement}</Badge>
                      </div>
                      <p className="text-sm">{element.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {storyContinuation && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Story Continuation</h4>
                  <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-purple-500/30">
                    <p className="text-sm">{storyContinuation}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleWritingPrompt}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PenTool className="h-4 w-4 mr-2" />
                )}
                Generate Writing Prompt
              </Button>
              
              {writingPrompts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Writing Prompts</h4>
                  {writingPrompts.map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="p-4 rounded-lg bg-muted/50 border-l-2 border-orange-500/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-sm">{prompt.title}</h5>
                        <Badge variant="outline" className="text-xs">{prompt.genre}</Badge>
                        <Badge variant="secondary" className="text-xs">{prompt.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prompt.prompt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIPanel;
