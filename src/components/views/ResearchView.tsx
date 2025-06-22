
import React from 'react';
import { Search } from 'lucide-react';

const ResearchView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <h2 className="font-semibold">Research</h2>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Research Vault</h3>
          <p>Research materials and references coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
};

export default ResearchView;
