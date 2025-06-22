
import React from 'react';
import { Sparkles, Brain, Zap } from 'lucide-react';

interface SubtleAIIndicatorProps {
  type: 'enhanced' | 'suggested' | 'analyzing';
  confidence?: number;
  className?: string;
  showLabel?: boolean;
}

const SubtleAIIndicator: React.FC<SubtleAIIndicatorProps> = ({
  type,
  confidence = 0.8,
  className = '',
  showLabel = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'enhanced':
        return <Sparkles className="h-3 w-3" />;
      case 'suggested':
        return <Zap className="h-3 w-3" />;
      case 'analyzing':
        return <Brain className="h-3 w-3 animate-pulse" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'enhanced':
        return 'text-blue-500';
      case 'suggested':
        return 'text-green-500';
      case 'analyzing':
        return 'text-purple-500';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'enhanced':
        return 'AI Enhanced';
      case 'suggested':
        return 'AI Suggested';
      case 'analyzing':
        return 'Analyzing...';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 ${getColor()} opacity-60 hover:opacity-100 transition-opacity ${className}`}>
      {getIcon()}
      {showLabel && (
        <span className="text-xs font-medium">
          {getLabel()}
          {confidence < 1 && ` (${Math.round(confidence * 100)}%)`}
        </span>
      )}
    </div>
  );
};

export default SubtleAIIndicator;
