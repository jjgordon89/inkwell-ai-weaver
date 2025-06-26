import React from 'react';

interface WordCountProps {
  wordCount: number;
}

export const WordCount: React.FC<WordCountProps> = React.memo(({ wordCount }) => {
  if (wordCount <= 0) {
    return null;
  }

  return (
    <span className="text-xs text-muted-foreground">
      {(wordCount / 1000).toFixed(1)}k
    </span>
  );
});

WordCount.displayName = 'WordCount';