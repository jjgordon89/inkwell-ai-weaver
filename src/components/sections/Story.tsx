
import React from 'react';
import { BookOpen } from 'lucide-react';
import { useDocumentOutline } from '@/hooks/outline/useDocumentOutline';
import StoryTabs from './story/StoryTabs';

const Story = () => {
  const { outlineStructure } = useDocumentOutline();

  const chapters = outlineStructure.items
    .filter(item => item.type === 'chapter')
    .sort((a, b) => a.position - b.position);

  return (
    <div className="h-full flex bg-background">
      {/* Left sidebar with chapters */}
      <div className="w-80 border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Chapters</h3>
        </div>

        {/* Chapters list */}
        <div className="flex-1 overflow-auto space-y-2">
          {chapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chapters yet</p>
              <p className="text-xs">Use the right sidebar to create chapters</p>
            </div>
          ) : (
            chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Chapter {index + 1}</span>
                  <span className="text-xs text-muted-foreground">
                    {chapter.wordCount || 0} words
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-1">{chapter.title}</h4>
                {chapter.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {chapter.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Story</h2>
        </div>

        <div className="flex-grow overflow-auto">
          <StoryTabs />
        </div>
      </div>
    </div>
  );
};

export default Story;
