
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Zap, 
  Target, 
  BookOpen, 
  Lightbulb,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Loader2
} from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { useAI } from '@/hooks/useAI';
import { WritingMetrics } from '@/hooks/ai/types';

const SmartWritingFeatures = () => {
  const { state, dispatch } = useWriting();
  const { toast } = useToast();
  const { 
    analyzeWritingQuality, 
    generateContextualSuggestions,
    predictNextWords,
    isAnalyzing, 
    isGenerating 
  } = useEnhancedAI();
  const { processText, isProcessing: isAIToolProcessing } = useAI();
  
  const [metrics, setMetrics] = useState<WritingMetrics | null>(null);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [nextWordPredictions, setNextWordPredictions] = useState<string[]>([]);

  const analyzeText = async () => {
    if (!state.currentDocument?.content) return;
    
    try {
      const result = await analyzeWritingQuality(state.currentDocument.content);
      setMetrics(result);
      toast({
        title: "Analysis Complete",
        description: `Text analyzed with ${result.readability.level.toLowerCase()} readability.`,
      });
    } catch (error) {
      console.error("Failed to analyze text:", error);
      toast({
        title: "Error",
        description: "Failed to analyze writing quality.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAutoSuggestions = async () => {
    if (!state.currentDocument?.content) return;
    try {
      const suggestions = await generateContextualSuggestions(state.currentDocument.content);
      setAutoSuggestions(suggestions);
      if (suggestions.length > 0) {
        toast({ title: "Suggestions refreshed!" });
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions.",
        variant: "destructive",
      });
    }
  };

  const handlePredictNextWords = async () => {
    if (!state.currentDocument?.content) return;
    try {
      const words = await predictNextWords(state.currentDocument.content);
      setNextWordPredictions(words);
      if (words.length > 0) {
        toast({ title: "Next word predictions updated." });
      }
    } catch(error) {
      console.error("Failed to predict next words:", error);
      toast({
        title: "Error",
        description: "Failed to predict next words.",
        variant: "destructive",
      });
    }
  };

  const handleGrammarCheck = async () => {
    if (!state.currentDocument || !state.currentDocument.content) return;
    const originalContent = state.currentDocument.content;
    toast({ title: "Checking grammar..." });
    try {
      const fixedContent = await processText(originalContent, 'fix-grammar');
      if (fixedContent !== originalContent) {
        dispatch({ 
            type: 'UPDATE_DOCUMENT_CONTENT', 
            payload: { id: state.currentDocument.id, content: fixedContent }
        });
        toast({
            title: "Grammar Check Complete",
            description: "Grammar and spelling have been corrected.",
        });
      } else {
        toast({
            title: "Grammar Check Complete",
            description: "No errors found.",
        });
      }
    } catch(error) {
      console.error("Grammar check failed:", error);
      toast({
        title: "Error",
        description: "Failed to perform grammar check.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Smart Writing Features
        </CardTitle>
        <CardDescription>
          Intelligent analysis and suggestions for your writing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="assistance">Writing Aid</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={analyzeText}
                disabled={isAnalyzing || !state.currentDocument?.content}
                className="w-full"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Writing Quality'}
              </Button>
              
              {metrics && (
                <div className="space-y-4">
                  {/* Readability Score */}
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Readability
                      </h4>
                      <Badge variant={getScoreBadgeVariant(metrics.readability.score)}>
                        {metrics.readability.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Level: {metrics.readability.level}
                    </p>
                    <div className="space-y-1">
                      {metrics.readability.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Other Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 border text-center">
                      <div className={`text-xl font-bold ${getScoreColor(metrics.sentenceVariety)}`}>
                        {metrics.sentenceVariety}%
                      </div>
                      <div className="text-xs text-muted-foreground">Sentence Variety</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border text-center">
                      <div className={`text-xl font-bold ${getScoreColor(metrics.vocabularyRichness)}`}>
                        {metrics.vocabularyRichness}%
                      </div>
                      <div className="text-xs text-muted-foreground">Vocabulary Richness</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border text-center">
                      <div className="text-xl font-bold text-primary">
                        {metrics.pacing}
                      </div>
                      <div className="text-xs text-muted-foreground">Pacing</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border text-center">
                      <div className={`text-xl font-bold ${getScoreColor(metrics.engagement)}`}>
                        {metrics.engagement}%
                      </div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Real-time Suggestions</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAutoSuggestions}
                  disabled={isGenerating || isAnalyzing}
                >
                  {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                  Refresh
                </Button>
              </div>
              
              {autoSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {autoSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 border-l-2 border-blue-500/30 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm flex-1">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Click "Refresh" to get AI-powered suggestions for your text.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assistance" className="space-y-4">
            <div className="space-y-4">
              {/* Word Predictions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next Word Predictions
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePredictNextWords}
                    disabled={isGenerating || isAnalyzing}
                  >
                    {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                    Predict
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {nextWordPredictions.length > 0 ? nextWordPredictions.map((word, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        toast({
                          title: "Word Suggestion",
                          description: `You can add logic to insert "${word}" into your text.`,
                        });
                      }}
                    >
                      {word}
                    </Badge>
                  )) : (
                    <p className="text-sm text-muted-foreground">Click "Predict" to see next word suggestions.</p>
                  )}
                </div>
              </div>

              {/* Writing Tools */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Writing Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start" onClick={handleGrammarCheck} disabled={isAIToolProcessing || !state.currentDocument?.content}>
                     {isAIToolProcessing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-2" />}
                    Grammar Check
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" disabled>
                    <BookOpen className="h-3 w-3 mr-2" />
                    Style Guide
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" disabled>
                    <Target className="h-3 w-3 mr-2" />
                    Clarity Score
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" disabled>
                    <Brain className="h-3 w-3 mr-2" />
                    Tone Detector
                  </Button>
                </div>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Smart features learn from your writing style to provide personalized assistance.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartWritingFeatures;
