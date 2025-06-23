
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Lightbulb, Loader2, AlertCircle } from 'lucide-react';

interface SmartSuggestionsTabProps {
  suggestions: string[];
  onRefresh: () => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  error?: string;
}

const SmartSuggestionsTab: React.FC<SmartSuggestionsTabProps> = ({
  suggestions,
  onRefresh,
  isGenerating,
  isAnalyzing,
  error
}) => {
  const isLoading = isGenerating || isAnalyzing;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Real-time Suggestions</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
          {isLoading ? 'Generating...' : 'Refresh'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
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
      ) : !isLoading ? (
        <Alert>
          <AlertDescription>
            Click "Refresh" to get AI-powered suggestions for your text.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Generating suggestions...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestionsTab;
