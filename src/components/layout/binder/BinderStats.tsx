
import React from 'react';
import { FileText, Target } from 'lucide-react';

interface BinderStatsProps {
  totalWords: number;
  totalDocs: number;
}

const BinderStats = ({ totalWords, totalDocs }: BinderStatsProps) => {
  return (
    <div className="p-3 bg-muted/20 rounded-lg mb-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{totalDocs}</div>
            <div className="text-xs text-muted-foreground">Documents</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{totalWords.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinderStats;
