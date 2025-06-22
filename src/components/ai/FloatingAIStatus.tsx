
import React, { useState, useEffect } from 'react';
import { Brain, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AIActivity {
  type: 'analyzing' | 'suggesting' | 'learning' | 'idle';
  message?: string;
  progress?: number;
}

interface FloatingAIStatusProps {
  activity: AIActivity;
  suggestions: number;
  isVisible?: boolean;
  onToggleDetails?: () => void;
}

const FloatingAIStatus: React.FC<FloatingAIStatusProps> = ({
  activity,
  suggestions,
  isVisible = true,
  onToggleDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (activity.type !== 'idle') {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [activity]);

  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (activity.type) {
      case 'analyzing':
        return <Brain className={`h-3 w-3 ${shouldPulse ? 'animate-pulse' : ''}`} />;
      case 'suggesting':
        return <Zap className={`h-3 w-3 ${shouldPulse ? 'animate-bounce' : ''}`} />;
      case 'learning':
        return <CheckCircle className={`h-3 w-3 ${shouldPulse ? 'animate-spin' : ''}`} />;
      default:
        return <Brain className="h-3 w-3 opacity-50" />;
    }
  };

  const getStatusColor = () => {
    switch (activity.type) {
      case 'analyzing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'suggesting': return 'text-green-600 bg-green-50 border-green-200';
      case 'learning': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 max-w-xs">
      <Card 
        className={`p-2 shadow-lg border transition-all duration-300 backdrop-blur-sm bg-background/95 ${getStatusColor()}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {getStatusIcon()}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium truncate">
                  {activity.type === 'idle' ? 'AI Ready' : 
                   activity.type === 'analyzing' ? 'Analyzing...' :
                   activity.type === 'suggesting' ? 'Generating...' :
                   'Learning...'}
                </span>
                {suggestions > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {suggestions}
                  </Badge>
                )}
              </div>
              
              {isExpanded && activity.message && (
                <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                  {activity.message}
                </p>
              )}
              
              {activity.progress !== undefined && (
                <div className="w-full bg-background/50 rounded-full h-1 mt-1">
                  <div 
                    className="bg-current h-1 rounded-full transition-all duration-300"
                    style={{ width: `${activity.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {onToggleDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetails}
              className="h-5 w-5 p-0 opacity-70 hover:opacity-100"
            >
              <AlertCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FloatingAIStatus;
