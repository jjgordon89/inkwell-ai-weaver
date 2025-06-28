
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorTextareaProps {
  content: string;
  onChange: (content: string) => void;
  onTextSelection: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
}

const EditorTextarea = ({ content, onChange, onTextSelection }: EditorTextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex-1 p-6">
      <Textarea
        value={content}
        onChange={handleChange}
        onMouseUp={onTextSelection}
        onKeyUp={onTextSelection}
        placeholder="Start writing your story..."
        className="min-h-[600px] resize-none border-none shadow-none text-base leading-relaxed focus-visible:ring-0"
      />
    </div>
  );
};

export default EditorTextarea;
