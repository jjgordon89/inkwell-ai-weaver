
import React from 'react';
import { Calendar } from 'lucide-react';

const TimelineView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <h2 className="font-semibold">Timeline</h2>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Timeline View</h3>
          <p>Chronological planning view coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
