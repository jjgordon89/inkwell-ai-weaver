
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import SmartTextCompletion from '@/components/ai/SmartTextCompletion';

interface EditorTextareaProps {
  content: string;
  textBeforeCursor: string;
  textAfterCursor: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextSelection: () => void;
  onTextCompletion: (completion: string) => void;
}

export interface EditorTextareaRef {
  focus: () => void;
  setSelectionRange: (start: number, end: number) => void;
  selectionStart: number;
  selectionEnd: number;
  getBoundingClientRect: () => DOMRect;
  value: string;
}

const EditorTextarea = forwardRef<EditorTextareaRef, EditorTextareaProps>(({
  content,
  textBeforeCursor,
  textAfterCursor,
  onChange,
  onTextSelection,
  onTextCompletion
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setSelectionRange: (start: number, end: number) => textareaRef.current?.setSelectionRange(start, end),
    get selectionStart() { return textareaRef.current?.selectionStart || 0; },
    get selectionEnd() { return textareaRef.current?.selectionEnd || 0; },
    getBoundingClientRect: () => textareaRef.current?.getBoundingClientRect() || new DOMRect(),
    get value() { return textareaRef.current?.value || ''; }
  }));

  return (
    <div className="flex-grow p-8 md:p-12 lg:p-16 relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={onChange}
        onMouseUp={onTextSelection}
        onKeyUp={onTextSelection}
        onSelect={onTextSelection}
        className="w-full max-w-3xl mx-auto h-full resize-none bg-transparent focus:outline-none font-serif text-lg leading-relaxed text-foreground"
        placeholder="Start writing your story... (AI assistance is active)"
      />
      
      {textBeforeCursor && (
        <SmartTextCompletion
          textBefore={textBeforeCursor}
          textAfter={textAfterCursor}
          cursorPosition={textareaRef.current?.selectionStart || 0}
          onAccept={onTextCompletion}
          onDismiss={() => {}}
          isEnabled={true}
        />
      )}
    </div>
  );
});

EditorTextarea.displayName = 'EditorTextarea';

export default EditorTextarea;
