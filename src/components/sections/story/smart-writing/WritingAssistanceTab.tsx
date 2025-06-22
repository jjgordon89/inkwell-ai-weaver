
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Zap, 
  CheckCircle, 
  BookOpen, 
  Target, 
  Brain, 
  Loader2 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WritingAssistanceTabProps {
  nextWordPredictions: string[];
  onPredictWords: () => void;
  onGrammarCheck: () => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  isAIProcessing: boolean;
  hasContent: boolean;
}

const WritingAssistanceTab: React.FC<WritingAssistanceTabProps> = ({
  nextWordPredictions,
  onPredictWords,
  onGrammarCheck,
  isGenerating,
  isAnalyzing,
  isAIProcessing,
  hasContent
}) => {
  const { toast } = useToast();

  return (
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
            onClick={onPredictWords}
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
          <Button variant="outline" size="sm" className="justify-start" onClick={onGrammarCheck} disabled={isAIProcessing || !hasContent}>
            {isAIProcessing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-2" />}
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
  );
};

export default WritingAssistanceTab;
