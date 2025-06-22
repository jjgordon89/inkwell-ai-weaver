
import React from 'react';

interface BinderStatsProps {
  totalWords: number;
  totalDocs: number;
}

const BinderStats = ({ totalWords, totalDocs }: BinderStatsProps) => {
  return (
    <div className="mt-4 pt-3 border-t border-border/50">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Words</div>
          <div className="font-semibold">{totalWords.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Documents</div>
          <div className="font-semibold">{totalDocs}</div>
        </div>
      </div>
    </div>
  );
};

export default BinderStats;
