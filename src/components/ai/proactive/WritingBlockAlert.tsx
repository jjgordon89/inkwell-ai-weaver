
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Users, ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { WritingBlock } from './WritingBlockDetector';

interface WritingBlockAlertProps {
  block: WritingBlock;
}

const WritingBlockAlert: React.FC<WritingBlockAlertProps> = ({ block }) => {
  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'writers_block': return <Brain className="h-4 w-4" />;
      case 'transition_gap': return <ArrowRight className="h-4 w-4" />;
      case 'character_inconsistency': return <Users className="h-4 w-4" />;
      case 'pacing_issue': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Alert className={getSeverityColor(block.severity)}>
      <div className="flex items-start gap-2">
        {getBlockIcon(block.type)}
        <div className="flex-1">
          <AlertDescription className="text-sm font-medium mb-2">
            {block.message}
          </AlertDescription>
          <div className="space-y-1">
            {block.suggestions.slice(0, 2).map((suggestion, idx) => (
              <div key={idx} className="text-xs flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default WritingBlockAlert;
