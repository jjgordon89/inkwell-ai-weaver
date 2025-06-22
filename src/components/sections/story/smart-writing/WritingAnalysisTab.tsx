import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Loader2 } from 'lucide-react';
import { WritingMetrics } from '@/hooks/ai/types';

interface WritingAnalysisTabProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasContent: boolean;
  metrics: WritingMetrics | null;
}

const WritingAnalysisTab: React.FC<WritingAnalysisTabProps> = ({
  onAnalyze,
  isAnalyzing,
  hasContent,
  metrics
}) => {
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
    <div className="space-y-3">
      <Button 
        onClick={onAnalyze}
        disabled={isAnalyzing || !hasContent}
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
  );
};

export default WritingAnalysisTab;
