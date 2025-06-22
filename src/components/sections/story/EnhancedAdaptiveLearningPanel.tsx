
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  Settings, 
  Lightbulb, 
  BarChart3, 
  BookOpen, 
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { useAdaptiveLearning } from '@/hooks/learning/useAdaptiveLearning';
import { useWriting } from '@/contexts/WritingContext';

const EnhancedAdaptiveLearningPanel = () => {
  const { state } = useWriting();
  const {
    currentGenre,
    genreHistory,
    generatePersonalizedCompletions,
    recordCompletionUsage,
    getEnhancedStats,
    analyzeWritingStyle,
    recordSuggestionFeedback,
    getPersonalizedSuggestions,
    getAdaptiveSettings,
    isLearning
  } = useAdaptiveLearning();

  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);
  const [completionPreviews, setCompletionPreviews] = useState<any[]>([]);
  const [adaptiveSettings, setAdaptiveSettings] = useState(getAdaptiveSettings());
  const [enhancedStats, setEnhancedStats] = useState(getEnhancedStats());

  useEffect(() => {
    const suggestions = getPersonalizedSuggestions('general');
    setPersonalizedSuggestions(suggestions);
    setAdaptiveSettings(getAdaptiveSettings());
    setEnhancedStats(getEnhancedStats());
  }, [getPersonalizedSuggestions, getAdaptiveSettings, getEnhancedStats]);

  useEffect(() => {
    // Generate completion previews based on recent text
    const currentText = state.currentDocument?.content || '';
    if (currentText.length > 20) {
      const lastWords = currentText.split(' ').slice(-5).join(' ');
      const completions = generatePersonalizedCompletions(lastWords, currentGenre, 3);
      setCompletionPreviews(completions);
    }
  }, [state.currentDocument?.content, currentGenre, generatePersonalizedCompletions]);

  const handleAnalyzeCurrentDocument = () => {
    if (state.currentDocument?.content) {
      analyzeWritingStyle(state.currentDocument.content);
    }
  };

  const handleSuggestionFeedback = (suggestionId: string, action: 'accepted' | 'rejected') => {
    recordSuggestionFeedback(suggestionId, action, 'adaptive', 'user-feedback');
  };

  const handleCompletionUsage = (completion: any) => {
    recordCompletionUsage(completion);
  };

  const getGenreColor = (genre: string) => {
    const colors = {
      fantasy: 'bg-purple-100 text-purple-800',
      scifi: 'bg-blue-100 text-blue-800',
      mystery: 'bg-gray-100 text-gray-800',
      romance: 'bg-pink-100 text-pink-800',
      thriller: 'bg-red-100 text-red-800',
      horror: 'bg-orange-100 text-orange-800',
      historical: 'bg-amber-100 text-amber-800',
      literary: 'bg-green-100 text-green-800',
      general: 'bg-slate-100 text-slate-800'
    };
    return colors[genre as keyof typeof colors] || colors.general;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Enhanced AI Learning System
        </CardTitle>
        <CardDescription>
          Advanced AI that learns your writing style, detects genres, and provides personalized completions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="genre" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Genre AI
            </TabsTrigger>
            <TabsTrigger value="completions" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Smart Complete
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Personal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Enhanced Learning Status</h4>
              <Button 
                size="sm" 
                onClick={handleAnalyzeCurrentDocument}
                disabled={isLearning || !state.currentDocument?.content}
              >
                {isLearning ? 'Learning...' : 'Analyze Document'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Genre</span>
                  <Badge className={getGenreColor(currentGenre)}>
                    {currentGenre}
                  </Badge>
                </div>
                <Progress value={adaptiveSettings.genreConfidence * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {Math.round(adaptiveSettings.genreConfidence * 100)}% confidence
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Learning Progress</span>
                  <span className="text-muted-foreground">
                    {enhancedStats.completionPatterns} patterns
                  </span>
                </div>
                <Progress value={Math.min(100, enhancedStats.completionPatterns)} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Active learning from your writing
                </div>
              </div>
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                The AI has learned <strong>{enhancedStats.completionPatterns}</strong> personalized patterns 
                from your <strong>{currentGenre}</strong> writing and is actively improving suggestions.
              </AlertDescription>
            </Alert>

            {enhancedStats.genreHistory.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Recent Genre Detection</h5>
                <div className="space-y-2">
                  {enhancedStats.genreHistory.slice(0, 3).map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <Badge className={getGenreColor(analysis.primaryGenre)}>
                        {analysis.primaryGenre}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(analysis.confidence * 100)}% confident
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="genre" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Automatic Genre Detection</h4>
                <Badge variant="outline">
                  Currently: {currentGenre}
                </Badge>
              </div>

              {Object.entries(enhancedStats.genreBreakdown || {}).length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Your Writing Genres</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(enhancedStats.genreBreakdown || {}).map(([genre, count]) => (
                      <div key={genre} className="flex items-center justify-between p-2 border rounded">
                        <Badge className={getGenreColor(genre)} variant="outline">
                          {genre}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {count} patterns
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  The AI automatically detects your writing genre and adapts suggestions accordingly. 
                  Each genre gets specialized advice for better storytelling.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="completions" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Personalized Text Completions</h4>
                <Badge variant="outline">
                  {enhancedStats.completionPatterns} learned patterns
                </Badge>
              </div>

              {completionPreviews.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Smart Completion Previews</h5>
                  <div className="space-y-2">
                    {completionPreviews.map((completion, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium">"{completion.text}"</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(completion.confidence * 100)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {completion.reasoning}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompletionUsage(completion)}
                          className="text-xs"
                        >
                          Use This Completion
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enhancedStats.mostUsedCompletions?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Your Most Used Patterns</h5>
                  <div className="space-y-2">
                    {enhancedStats.mostUsedCompletions.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm font-mono">"{pattern.trigger}" → "{pattern.completion}"</span>
                        <Badge variant="outline" className="text-xs">
                          Used {pattern.frequency}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Completions adapt to your unique writing patterns and improve over time as you write more.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="personalized" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Personalized Writing Suggestions</h4>
                <Badge variant="outline">
                  Tailored to {currentGenre}
                </Badge>
              </div>

              {personalizedSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {personalizedSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm mb-3">{suggestion}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSuggestionFeedback(`suggestion-${index}`, 'accepted')}
                          className="text-xs"
                        >
                          Helpful
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleSuggestionFeedback(`suggestion-${index}`, 'rejected')}
                          className="text-xs"
                        >
                          Not helpful
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Write more content to receive personalized suggestions</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h5 className="font-medium mb-2">Learning Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Genre confidence:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(adaptiveSettings.genreConfidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completion patterns:</span>
                    <span className="ml-2 font-medium">{enhancedStats.completionPatterns}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Learning active:</span>
                    <span className="ml-2 font-medium">{isLearning ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auto-suggestions:</span>
                    <span className="ml-2 font-medium">
                      {adaptiveSettings.autoSuggestionsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedAdaptiveLearningPanel;
