import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";

interface ReadabilityScore {
  score: number;
  level: string;
  suggestions: string[];
}

interface WritingMetrics {
  readability: ReadabilityScore;
  sentenceVariety: number;
  vocabularyRichness: number;
  pacing: string;
  engagement: number;
}

const SmartWritingFeatures = () => {
  const { state } = useWriting();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<WritingMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [nextWordPredictions, setNextWordPredictions] = useState<string[]>([]);

  const analyzeText = async () => {
    if (!state.currentDocument?.content) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = state.currentDocument.content;
    const words = content.split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    
    // Calculate basic metrics
    const avgWordsPerSentence = words.length / sentences.length || 0;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyRatio = uniqueWords.size / words.length || 0;
    
    // Mock readability calculation
    const readabilityScore = Math.max(0, Math.min(100, 
      100 - (avgWordsPerSentence * 2) + (vocabularyRatio * 20)
    ));
    
    const readabilityLevel = readabilityScore > 80 ? 'Excellent' :
                           readabilityScore > 60 ? 'Good' :
                           readabilityScore > 40 ? 'Fair' : 'Needs Improvement';
    
    const mockMetrics: WritingMetrics = {
      readability: {
        score: Math.round(readabilityScore),
        level: readabilityLevel,
        suggestions: [
          'Consider varying sentence length for better flow',
          'Use more active voice constructions',
          'Replace some complex words with simpler alternatives'
        ]
      },
      sentenceVariety: Math.round(Math.random() * 40 + 60),
      vocabularyRichness: Math.round(vocabularyRatio * 100),
      pacing: avgWordsPerSentence > 20 ? 'Slow' : 
              avgWordsPerSentence > 15 ? 'Moderate' : 'Fast',
      engagement: Math.round(Math.random() * 30 + 70)
    };
    
    setMetrics(mockMetrics);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Text analyzed with ${readabilityLevel.toLowerCase()} readability`,
    });
  };

  const generateAutoSuggestions = () => {
    const suggestions = [
      'Add sensory details to enhance immersion',
      'Consider showing instead of telling',
      'Vary sentence structure for rhythm',
      'Strengthen dialogue with subtext',
      'Clarify character motivations',
      'Enhance setting description'
    ];
    
    setAutoSuggestions(suggestions.slice(0, 3));
  };

  const predictNextWords = () => {
    const predictions = [
      'carefully', 'suddenly', 'quietly', 'through', 'towards', 
      'beneath', 'however', 'meanwhile', 'nevertheless', 'therefore'
    ];
    
    setNextWordPredictions(predictions.slice(0, 5));
  };

  useEffect(() => {
    if (state.currentDocument?.content) {
      generateAutoSuggestions();
      predictNextWords();
    }
  }, [state.currentDocument?.content]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
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
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
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
                  onClick={generateAutoSuggestions}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              
              {autoSuggestions.length > 0 && (
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
              )}

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Suggestions are generated based on your writing patterns and current context.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="assistance" className="space-y-4">
            <div className="space-y-4">
              {/* Word Predictions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Next Word Predictions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {nextWordPredictions.map((word, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        toast({
                          title: "Word Suggestion",
                          description: `"${word}" would be added to your text`,
                        });
                      }}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Writing Tools */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Writing Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Grammar Check
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <BookOpen className="h-3 w-3 mr-2" />
                    Style Guide
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Target className="h-3 w-3 mr-2" />
                    Clarity Score
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
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
