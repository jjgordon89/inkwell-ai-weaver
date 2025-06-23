
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Brain, Eye, TrendingUp, Users, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useStyleConsistency } from '@/hooks/writing-intelligence/useStyleConsistency';
import { usePlotHoleDetection } from '@/hooks/writing-intelligence/usePlotHoleDetection';
import { useCharacterArcTracking } from '@/hooks/writing-intelligence/useCharacterArcTracking';
import { usePacingAnalysis } from '@/hooks/writing-intelligence/usePacingAnalysis';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";

const AdvancedWritingIntelligence = () => {
  const { state } = useWriting();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('style');

  // Initialize all intelligence hooks
  const {
    styleProfile,
    consistencyIssues,
    isMonitoring,
    isAnalyzing: isAnalyzingStyle,
    startMonitoring,
    stopMonitoring,
    analyzeStyleConsistency,
    buildStyleProfile
  } = useStyleConsistency();

  const {
    plotHoles,
    isAnalyzing: isAnalyzingPlot,
    runPlotHoleDetection,
    dismissPlotHole
  } = usePlotHoleDetection();

  const {
    characterArcs,
    arcInsights,
    isAnalyzing: isAnalyzingArcs,
    trackCharacterArcs,
    dismissInsight
  } = useCharacterArcTracking();

  const {
    pacingAnalysis,
    isAnalyzing: isAnalyzingPacing,
    runPacingAnalysis
  } = usePacingAnalysis();

  const runFullAnalysis = async () => {
    if (!state.currentDocument?.content) {
      toast({
        title: "No Content",
        description: "Please add some content to your document before running analysis.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Running Full Analysis",
      description: "Analyzing style, plot, characters, and pacing...",
    });

    // Run all analyses in parallel
    await Promise.all([
      analyzeStyleConsistency(state.currentDocument.content),
      buildStyleProfile(state.currentDocument.content),
      runPlotHoleDetection(),
      trackCharacterArcs(),
      runPacingAnalysis()
    ]);

    toast({
      title: "Analysis Complete",
      description: "All writing intelligence features have been analyzed.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'major': return 'bg-red-100 text-red-800';
      case 'medium':
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low':
      case 'minor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAnalyzing = isAnalyzingStyle || isAnalyzingPlot || isAnalyzingArcs || isAnalyzingPacing;
  const hasContent = !!state.currentDocument?.content;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Advanced Writing Intelligence
        </CardTitle>
        <CardDescription>
          AI-powered analysis for style consistency, plot holes, character arcs, and pacing
        </CardDescription>
        <div className="flex gap-2">
          <Button 
            onClick={runFullAnalysis}
            disabled={isAnalyzing || !hasContent}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Full Analysis
              </>
            )}
          </Button>
          <Button
            variant={isMonitoring ? "destructive" : "outline"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasContent && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Add content to your document to enable writing intelligence features.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="style" className="relative">
              Style
              {consistencyIssues.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {consistencyIssues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="plot" className="relative">
              Plot
              {plotHoles.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {plotHoles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="characters" className="relative">
              Characters
              {arcInsights.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {arcInsights.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pacing">
              Pacing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Style Consistency</h3>
              <div className="flex items-center gap-2">
                {isMonitoring && (
                  <Badge variant="outline" className="text-green-600">
                    <Eye className="h-3 w-3 mr-1" />
                    Monitoring
                  </Badge>
                )}
              </div>
            </div>

            {styleProfile && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Avg Sentence Length</div>
                  <div className="text-lg">{Math.round(styleProfile.averageSentenceLength)} words</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Vocabulary</div>
                  <Badge variant="outline">{styleProfile.vocabularyComplexity}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium">Tone Consistency</div>
                  <div className="flex items-center gap-2">
                    <Progress value={styleProfile.toneConsistency} className="flex-1" />
                    <span className="text-sm">{styleProfile.toneConsistency}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Voice Strength</div>
                  <div className="flex items-center gap-2">
                    <Progress value={styleProfile.voiceStrength} className="flex-1" />
                    <span className="text-sm">{styleProfile.voiceStrength}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {consistencyIssues.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No style consistency issues detected.
                  </AlertDescription>
                </Alert>
              ) : (
                consistencyIssues.map((issue) => (
                  <Card key={issue.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(issue.severity)} variant="outline">
                            {issue.severity}
                          </Badge>
                          <Badge variant="secondary">{issue.type}</Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{issue.description}</p>
                        <p className="text-xs text-muted-foreground mb-2">"{issue.location.text}"</p>
                        <p className="text-xs text-blue-600">{issue.suggestion}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="plot" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Plot Hole Detection</h3>
              <Button 
                size="sm" 
                onClick={runPlotHoleDetection}
                disabled={isAnalyzingPlot || !hasContent}
              >
                {isAnalyzingPlot ? 'Analyzing...' : 'Analyze Plot'}
              </Button>
            </div>

            <div className="space-y-2">
              {plotHoles.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No plot holes detected in your story.
                  </AlertDescription>
                </Alert>
              ) : (
                plotHoles.map((hole) => (
                  <Card key={hole.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(hole.severity)} variant="outline">
                            {hole.severity}
                          </Badge>
                          <Badge variant="secondary">{hole.type}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{hole.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{hole.description}</p>
                        <p className="text-xs text-muted-foreground mb-2">Location: {hole.location}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Suggestions:</p>
                          {hole.suggestions.map((suggestion, index) => (
                            <p key={index} className="text-xs text-blue-600">• {suggestion}</p>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissPlotHole(hole.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="characters" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Character Arc Tracking</h3>
              <Button 
                size="sm" 
                onClick={trackCharacterArcs}
                disabled={isAnalyzingArcs || !hasContent}
              >
                {isAnalyzingArcs ? 'Analyzing...' : 'Track Arcs'}
              </Button>
            </div>

            {characterArcs.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Character Progress</h4>
                {characterArcs.map((arc) => (
                  <Card key={arc.characterId} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{arc.characterName}</h5>
                      <Badge variant="outline">{arc.arcStage}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{arc.progressPercentage}%</span>
                        </div>
                        <Progress value={arc.progressPercentage} className="mt-1" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Consistency</span>
                          <span>{arc.consistencyScore}%</span>
                        </div>
                        <Progress value={arc.consistencyScore} className="mt-1" />
                      </div>
                      {arc.keyDevelopments.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Key Developments:</p>
                          {arc.keyDevelopments.slice(0, 2).map((dev, index) => (
                            <p key={index} className="text-xs text-muted-foreground">• {dev}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {arcInsights.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Character Insights</h4>
                {arcInsights.map((insight) => (
                  <Card key={insight.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={getSeverityColor(insight.priority)} 
                            variant="outline"
                          >
                            {insight.priority}
                          </Badge>
                          <Badge variant="secondary">{insight.type}</Badge>
                        </div>
                        <h5 className="font-medium mb-1">{insight.title}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        {insight.actionItems.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Action Items:</p>
                            {insight.actionItems.slice(0, 2).map((item, index) => (
                              <p key={index} className="text-xs text-blue-600">• {item}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissInsight(insight.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pacing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pacing Analysis</h3>
              <Button 
                size="sm" 
                onClick={runPacingAnalysis}
                disabled={isAnalyzingPacing || !hasContent}
              >
                {isAnalyzingPacing ? 'Analyzing...' : 'Analyze Pacing'}
              </Button>
            </div>

            {pacingAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold">{pacingAnalysis.pacingScore}/100</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-sm">
                      {pacingAnalysis.overallPace}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Pattern</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{pacingAnalysis.segments.length}</div>
                    <div className="text-sm text-muted-foreground">Segments</div>
                  </div>
                </div>

                {pacingAnalysis.visualData && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Intensity Curve</h4>
                    <div className="flex items-end space-x-1 h-24 bg-muted/20 rounded p-2">
                      {pacingAnalysis.visualData.intensityData.map((intensity, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-primary/60 flex items-end justify-center text-xs text-white"
                          style={{ 
                            height: `${Math.max((intensity / 100) * 100, 5)}%`,
                            minHeight: '2px'
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Story progression (left to right)
                    </div>
                  </div>
                )}

                {pacingAnalysis.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations</h4>
                    {pacingAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedWritingIntelligence;
