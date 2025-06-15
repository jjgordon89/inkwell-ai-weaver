
import React from 'react';
import { GitBranch } from 'lucide-react';

const CharacterArcsTab = () => {
  return (
    <div className="space-y-3">
      <div className="text-center py-6">
        <GitBranch className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Character arc tracking will be implemented in the next update.
        </p>
      </div>
    </div>
  );
};

export default CharacterArcsTab;
