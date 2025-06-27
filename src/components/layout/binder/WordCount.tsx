import React from 'react';

interface WordCountProps {
  wordCount: number;
}

const WordCount: React.FC<WordCountProps> = ({ wordCount }) => {
  if (wordCount <= 0) return null;
  
  return (
    <span className="text-xs text-muted-foreground">
      {(wordCount / 1000).toFixed(1)}k
    </span>
  );
};

export default WordCount;