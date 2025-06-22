import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, TrendingUp, Loader2, Zap } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useStoryStructure } from '@/hooks/story/useStoryStructure';
import { usePacingAnalysis } from '@/hooks/story/usePacingAnalysis';
import { useToast } from "@/hooks/use-toast";
import type { PacingAnalysis } from '@/hooks/story/types';

const PacingAnalyzer = () => {
  const { state } = useWriting();
  const { storyStructure, getTensionCurve } = useStoryStructure();
  const { analyzePacing, isAnalyzing } = usePacingAnalysis();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<PacingAnalysis | null>(null);

  const handleAnalyzePacing = async () => {
    if (!state.currentDocument || storyStructure.scenes.length === 0) {
      toast({
        title: "Cannot Analyze",
        description: "Please add some scenes and ensure you have content to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await analyzePacing(storyStructure.scenes, state.currentDocument.content);
      if (result) {
        setAnalysis(result);
        toast({
          title: "Pacing Analysis Complete",
          description: `Overall pacing assessed as ${result.overallPace}`,
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze story pacing. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to analyze pacing:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze story pacing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaceColor = (pace: string) => {
    switch (pace) {
      case 'slow': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-green-100 text-green-800';
      case 'fast': return 'bg-red-100 text-red-800';
      case 'varied': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tensionCurve = getTensionCurve();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Pacing Analysis
        </CardTitle>
        <CardDescription>
          Analyze your story's pacing and get AI-powered recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={handleAnalyzePacing}
          disabled={isAnalyzing || !state.currentDocument || storyStructure.scenes.length === 0}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Pacing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Story Pacing
            </>
          )}
        </Button>

        {storyStructure.scenes.length === 0 && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Add some scenes in the Scene Planner to enable pacing analysis.
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Overall Assessment</h3>
              <div className="flex items-center gap-2">
                <Badge className={getPaceColor(analysis.overallPace)} variant="outline">
                  {analysis.overallPace.charAt(0).toUpperCase() + analysis.overallPace.slice(1)} Pacing
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Act-by-Act Scores</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getActScoreColor(analysis.actPacing.act1)}`}>
                    {analysis.actPacing.act1}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Act 1</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getActScoreColor(analysis.actPacing.act2)}`}>
                    {analysis.actPacing.act2}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Act 2</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getActScoreColor(analysis.actPacing.act3)}`}>
                    {analysis.actPacing.act3}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Act 3</div>
                </div>
              </div>
            </div>

            {analysis.recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">AI Recommendations</h3>
                <div className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm"
                    >
                      {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tensionCurve.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Tension Curve</h3>
            <div className="space-y-2">
              <div className="flex items-end space-x-1 h-24">
                {tensionCurve.map((tension, index) => (
                  <div 
                    key={index}
                    className="flex-1 bg-primary/20 border-t-2 border-primary flex items-end justify-center text-xs"
                    style={{ height: `${(tension / 10) * 100}%` }}
                  >
                    {tension}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Scene progression (left to right)
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PacingAnalyzer;
