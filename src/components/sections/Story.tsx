
import React from 'react';
import { BookOpen } from 'lucide-react';
import StoryTabs from './story/StoryTabs';

const Story = () => {
  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Story</h2>
      </div>

      <div className="flex-grow overflow-auto">
        <StoryTabs />
      </div>
    </div>
  );
};

export default Story;
