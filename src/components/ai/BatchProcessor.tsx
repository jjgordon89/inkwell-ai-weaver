
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckSquare, 
  Square, 
  Play, 
  Check, 
  X,
  Loader2 
} from 'lucide-react';
import { useWorkflowOptimization } from '@/hooks/useWorkflowOptimization';

interface BatchProcessorProps {
  suggestions: string[];
  onBatchComplete?: () => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({
  suggestions,
  onBatchComplete
}) => {
  const { 
    batchSuggestions, 
    isProcessingBatch, 
    batchProcessSuggestions, 
    applyBatchSuggestion 
  } = useWorkflowOptimization();
  
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedSuggestions(suggestions);
    } else {
      setSelectedSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string, checked: boolean) => {
    if (checked) {
      setSelectedSuggestions(prev => [...prev, suggestion]);
    } else {
      setSelectedSuggestions(prev => prev.filter(s => s !== suggestion));
      setSelectAll(false);
    }
  };

  const handleBatchProcess = async () => {
    await batchProcessSuggestions(selectedSuggestions);
    setSelectedSuggestions([]);
    setSelectAll(false);
    onBatchComplete?.();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Batch Processor
          </CardTitle>
          {suggestions.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {suggestions.length} suggestions
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length > 0 ? (
          <>
            {/* Batch controls */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-xs font-medium">
                  Select All ({selectedSuggestions.length}/{suggestions.length})
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleBatchProcess}
                disabled={selectedSuggestions.length === 0 || isProcessingBatch}
                className="h-6"
              >
                {isProcessingBatch ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Process
              </Button>
            </div>

            {/* Suggestions list */}
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={selectedSuggestions.includes(suggestion)}
                      onCheckedChange={(checked) => 
                        handleSelectSuggestion(suggestion, checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No suggestions available for batch processing</p>
          </div>
        )}

        {/* Processed batch results */}
        {batchSuggestions.length > 0 && (
          <>
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium mb-2">Processed Suggestions</h4>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {batchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">
                          {suggestion.text}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${getConfidenceColor(suggestion.confidence)}`}
                        >
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applyBatchSuggestion(suggestion.id)}
                          disabled={suggestion.applied}
                          className="h-5 w-5 p-0"
                        >
                          {suggestion.applied ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchProcessor;
