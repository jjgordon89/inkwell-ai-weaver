
import React from 'react';

interface EditorFooterProps {
  wordCount: number;
}

const EditorFooter: React.FC<EditorFooterProps> = ({ wordCount }) => {
  return (
    <div className="p-4 border-t text-right text-sm text-muted-foreground">
      {wordCount} Words
    </div>
  );
};

export default EditorFooter;
