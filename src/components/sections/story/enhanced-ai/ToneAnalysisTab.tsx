
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Loader2, Plus } from 'lucide-react';
import { ToneAnalysis } from '@/hooks/ai/types';

interface ToneAnalysisTabProps {
  toneAnalysis: ToneAnalysis | null;
  onAnalyzeTone: () => void;
  onApplySuggestion: (suggestion: string) => void;
  isProcessing: boolean;
  hasContent: boolean;
}

const ToneAnalysisTab: React.FC<ToneAnalysisTabProps> = ({
  toneAnalysis,
  onAnalyzeTone,
  onApplySuggestion,
  isProcessing,
  hasContent
}) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={onAnalyzeTone}
        disabled={isProcessing || !hasContent}
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
              <div 
                key={index}
                className="flex items-start justify-between gap-2 group hover:bg-muted/30 p-2 rounded transition-colors"
              >
                <p className="text-sm text-muted-foreground flex-1">• {suggestion}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToneAnalysisTab;
