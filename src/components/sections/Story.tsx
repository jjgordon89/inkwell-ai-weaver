
import React, { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useDocumentOutline } from '@/hooks/outline/useDocumentOutline';
import type { OutlineItem } from '@/hooks/outline/types';
import ChapterEditor from './story/ChapterEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';

const Story = () => {
  const { outlineStructure, updateItem } = useDocumentOutline();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const chapters = useMemo(() => {
    return outlineStructure.items
      .filter(item => item.type === 'chapter')
      .sort((a, b) => a.position - b.position);
  }, [outlineStructure.items]);

  const selectedChapter = useMemo(() => {
      if (!selectedChapterId) return null;
      return outlineStructure.items.find(item => item.id === selectedChapterId);
  }, [selectedChapterId, outlineStructure.items]);


  const handleContentChange = (content: string) => {
    if (selectedChapter) {
      updateItem(selectedChapter.id, { content });
    }
  };

  if (selectedChapter) {
    return (
      <div className="h-full flex flex-col bg-background p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{selectedChapter.title}</h2>
            </div>
            <Button onClick={() => setSelectedChapterId(null)} variant="outline">Back to Chapters</Button>
        </div>
        <ChapterEditor chapter={selectedChapter} onContentChange={handleContentChange} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Story Chapters</h2>
      </div>

      <div className="flex-grow overflow-auto space-y-4">
        {chapters.length > 0 ? chapters.map(chapter => (
          <Card key={chapter.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedChapterId(chapter.id)}>
             <CardHeader>
                <CardTitle>{chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{chapter.description || 'No description'}</p>
                <div className="text-xs text-muted-foreground mt-2">
                    {(chapter.wordCount || 0).toLocaleString()} words
                </div>
            </CardContent>
          </Card>
        )) : (
            <EmptyState
                icon={BookOpen}
                title="No Chapters Yet"
                description="Go to the Outline section to add chapters to your story."
            />
        )}
      </div>
    </div>
  );
};

export default Story;
