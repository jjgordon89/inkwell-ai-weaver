
import React from 'react';
import { Layers } from 'lucide-react';
import StoryStructureTools from './story/StoryStructureTools';

const StoryStructure = () => {
  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Story Structure</h2>
      </div>

      <div className="flex-grow overflow-auto">
        <StoryStructureTools />
      </div>
    </div>
  );
};

export default StoryStructure;
