import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Target } from 'lucide-react';

interface WordCountDisplayProps {
  content: string;
  targetWordCount?: number;
  readingTime?: boolean;
  className?: string;
}

const WordCountDisplay: React.FC<WordCountDisplayProps> = ({
  content,
  targetWordCount,
  readingTime = true,
  className = ''
}) => {
  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const estimatedReadingTime = Math.ceil(words / 200); // Average reading speed
    const progress = targetWordCount ? (words / targetWordCount) * 100 : 0;

    return {
      words,
      characters,
      charactersNoSpaces,
      estimatedReadingTime,
      progress
    };
  }, [content, targetWordCount]);

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      {/* Word Count */}
      <div className="flex items-center gap-1">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">{stats.words.toLocaleString()}</span>
        <span className="text-muted-foreground">words</span>
      </div>

      {/* Target Progress */}
      {targetWordCount && (
        <div className="flex items-center gap-1">
          <Target className="h-3 w-3 text-muted-foreground" />
          <Badge 
            variant={stats.progress >= 100 ? "default" : "secondary"}
            className="text-xs"
          >
            {stats.progress.toFixed(0)}%
          </Badge>
        </div>
      )}

      {/* Reading Time */}
      {readingTime && stats.words > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {stats.estimatedReadingTime} min read
          </span>
        </div>
      )}

      {/* Character Count */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{stats.characters.toLocaleString()} chars</span>
        <span>({stats.charactersNoSpaces.toLocaleString()} no spaces)</span>
      </div>
    </div>
  );
};

export default WordCountDisplay;
