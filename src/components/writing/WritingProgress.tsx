import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Clock, FileText } from 'lucide-react';

interface WritingProgressProps {
  currentWordCount: number;
  targetWordCount: number;
  timeSpent?: string;
  lastSession?: string;
  wordsPerMinute?: number;
  className?: string;
}

const WritingProgress: React.FC<WritingProgressProps> = ({
  currentWordCount,
  targetWordCount,
  timeSpent,
  lastSession,
  wordsPerMinute,
  className = ''
}) => {
  const progressPercentage = targetWordCount > 0 
    ? Math.min((currentWordCount / targetWordCount) * 100, 100) 
    : 0;
  
  const remainingWords = Math.max(targetWordCount - currentWordCount, 0);
  
  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    if (progressPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Writing Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{currentWordCount.toLocaleString()} words</span>
            <span>{targetWordCount.toLocaleString()} target</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-center">
            <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
              {progressPercentage.toFixed(1)}% Complete
            </Badge>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{remainingWords.toLocaleString()}</div>
              <div className="text-muted-foreground text-xs">Words remaining</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{Math.ceil(currentWordCount / 250)}</div>
              <div className="text-muted-foreground text-xs">Pages (est.)</div>
            </div>
          </div>
          
          {timeSpent && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{timeSpent}</div>
                <div className="text-muted-foreground text-xs">Time spent</div>
              </div>
            </div>
          )}
          
          {wordsPerMinute && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{wordsPerMinute}</div>
                <div className="text-muted-foreground text-xs">Words/min</div>
              </div>
            </div>
          )}
        </div>

        {/* Last Session Info */}
        {lastSession && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Last session: {lastSession}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WritingProgress;
