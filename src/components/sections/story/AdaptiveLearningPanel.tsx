
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Settings, Lightbulb, BarChart3 } from 'lucide-react';
import { useAdaptiveLearning } from '@/hooks/learning/useAdaptiveLearning';
import { useWriting } from '@/contexts/WritingContext';

const AdaptiveLearningPanel = () => {
  const { state } = useWriting();
  const {
    preferences,
    writingPatterns,
    suggestionHistory,
    isLearning,
    analyzeWritingStyle,
    recordSuggestionFeedback,
    getPersonalizedSuggestions,
    getAdaptiveSettings
  } = useAdaptiveLearning();

  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);
  const [adaptiveSettings, setAdaptiveSettings] = useState(getAdaptiveSettings());

  useEffect(() => {
    const suggestions = getPersonalizedSuggestions('general');
    setPersonalizedSuggestions(suggestions);
    setAdaptiveSettings(getAdaptiveSettings());
  }, [preferences, getPersonalizedSuggestions, getAdaptiveSettings]);

  const handleAnalyzeCurrentDocument = () => {
    if (state.currentDocument?.content) {
      analyzeWritingStyle(state.currentDocument.content);
    }
  };

  const handleSuggestionFeedback = (suggestionId: string, action: 'accepted' | 'rejected') => {
    recordSuggestionFeedback(suggestionId, action, 'style', 'user-feedback');
  };

  const getCategoryStats = (category: string) => {
    const categoryPrefs = preferences.filter(p => p.category === category);
    const avgConfidence = categoryPrefs.length > 0 
      ? categoryPrefs.reduce((sum, p) => sum + p.confidence, 0) / categoryPrefs.length 
      : 0;
    return {
      count: categoryPrefs.length,
      confidence: Math.round(avgConfidence * 100)
    };
  };

  const getRecentFeedback = () => {
    return suggestionHistory
      .slice(0, 10)
      .reduce((acc, feedback) => {
        acc[feedback.action] = (acc[feedback.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  };

  const topPatterns = writingPatterns
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const recentFeedback = getRecentFeedback();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Adaptive Learning System
        </CardTitle>
        <CardDescription>
          AI learns your writing style and personalizes assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Writing Style Analysis</h4>
              <Button 
                size="sm" 
                onClick={handleAnalyzeCurrentDocument}
                disabled={isLearning || !state.currentDocument?.content}
              >
                {isLearning ? 'Analyzing...' : 'Analyze Current Document'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Style Preferences</span>
                  <span>{getCategoryStats('style').count} learned</span>
                </div>
                <Progress value={getCategoryStats('style').confidence} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {getCategoryStats('style').confidence}% confidence
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assistance Preferences</span>
                  <span>{getCategoryStats('assistance').count} learned</span>
                </div>
                <Progress value={getCategoryStats('assistance').confidence} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {getCategoryStats('assistance').confidence}% confidence
                </div>
              </div>
            </div>

            {topPatterns.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Your Writing Patterns</h5>
                <div className="space-y-2">
                  {topPatterns.map((pattern) => (
                    <div key={pattern.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm font-mono">"{pattern.pattern}"</span>
                      <Badge variant="outline" className="text-xs">
                        {pattern.frequency}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(recentFeedback).length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Recent Feedback</h5>
                <div className="flex gap-2">
                  {Object.entries(recentFeedback).map(([action, count]) => (
                    <div key={action} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${
                        action === 'accepted' ? 'bg-green-500' :
                        action === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm">{count} {action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Personalized Suggestions</h4>
              <Badge variant="outline" className="text-xs">
                Tailored to your style
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
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Write more content to receive personalized suggestions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Assistance Intensity</h5>
                  <p className="text-sm text-muted-foreground">How much AI help you prefer</p>
                </div>
                <Progress value={adaptiveSettings.assistanceIntensity * 100} className="w-24 h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Suggestion Frequency</h5>
                  <p className="text-sm text-muted-foreground">How often you want suggestions</p>
                </div>
                <Progress value={adaptiveSettings.suggestionFrequency * 100} className="w-24 h-2" />
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Adaptive Features</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-suggestions</span>
                    <Badge variant={adaptiveSettings.autoSuggestionsEnabled ? "default" : "secondary"}>
                      {adaptiveSettings.autoSuggestionsEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Proactive assistance</span>
                    <Badge variant={adaptiveSettings.proactiveSuggestionsEnabled ? "default" : "secondary"}>
                      {adaptiveSettings.proactiveSuggestionsEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h5 className="font-medium mb-2">Learning Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total preferences:</span>
                    <span className="ml-2 font-medium">{preferences.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Writing patterns:</span>
                    <span className="ml-2 font-medium">{writingPatterns.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Feedback entries:</span>
                    <span className="ml-2 font-medium">{suggestionHistory.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Learning active:</span>
                    <span className="ml-2 font-medium">{isLearning ? 'Yes' : 'No'}</span>
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

export default AdaptiveLearningPanel;
