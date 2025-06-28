
import React from 'react';

interface WordCountProps {
  count: number;
  className?: string;
}

const WordCount: React.FC<WordCountProps> = ({ count, className = "" }) => {
  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {formatCount(count)} words
    </span>
  );
};

export default WordCount;
