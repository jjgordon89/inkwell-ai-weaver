
import React from 'react';

interface EditorTextareaProps {
  content: string;
  onChange: (newContent: string) => void;
  onTextSelection: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
}

const EditorTextarea: React.FC<EditorTextareaProps> = ({
  content,
  onChange,
  onTextSelection
}) => {
  return (
    <div className="flex-1 p-6 relative">
      <div className="max-w-4xl mx-auto h-full">
        <textarea
          className="w-full h-full min-h-96 p-6 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-base leading-relaxed"
          placeholder="Start writing your story... (AI assistance is active)"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onMouseUp={onTextSelection}
          onKeyUp={onTextSelection}
          style={{ fontFamily: 'Georgia, serif' }}
        />
      </div>
    </div>
  );
};

export default EditorTextarea;
