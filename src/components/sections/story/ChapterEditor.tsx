
import React, { useState, useEffect } from 'react';
import type { OutlineItem } from '@/hooks/outline/types';

interface ChapterEditorProps {
  chapter: OutlineItem;
  onContentChange: (content: string) => void;
}

const ChapterEditor = ({ chapter, onContentChange }: ChapterEditorProps) => {
  const [content, setContent] = useState(chapter.content || '');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setContent(chapter.content || '');
  }, [chapter]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);

    const handler = setTimeout(() => {
      if (content !== chapter.content) {
        onContentChange(content);
      }
    }, 500); // Debounce updates

    return () => {
      clearTimeout(handler);
    };
  }, [content, onContentChange, chapter.content]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow p-8 md:p-12 lg:p-16">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full max-w-3xl mx-auto h-full resize-none bg-transparent focus:outline-none font-serif text-lg leading-relaxed text-foreground"
          placeholder="Start writing your chapter..."
        />
      </div>
      <div className="p-4 border-t text-right text-sm text-muted-foreground">
        {wordCount} Words
      </div>
    </div>
  );
};

export default ChapterEditor;
