import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './rich-text-editor.css';
import { sanitizeRichText } from '@/utils/stringUtils';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ContentFormat } from '@/types/document';
import { RichTextEditorProps, EditorMethods, TextSelection, TextFormat } from '@/types/editor';

const DEFAULT_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  },
};

const DEFAULT_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link'
];

const RichTextEditor = forwardRef<EditorMethods, RichTextEditorProps>(({
  value,
  onChange,
  label,
  placeholder = 'Write something...',
  className = '',
  readOnly = false,
  height = '300px',
  error,
  onBlur,
  id,
  'aria-label': ariaLabel,
  format = ContentFormat.RICH_TEXT,
  extraControls,
  onFocus,
  autoFocus = false,
  showToolbar = true,
  theme = 'snow',
  sanitize = true,
  maxLength,
  showCharCount = false,
  onKeyDown,
  toolbarConfig,
  imageUploadHandler,
  accessibility
}, ref) => {
  const [editorValue, setEditorValue] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const quillRef = useRef<ReactQuill>(null);
  const uniqueId = id || `rich-text-${Math.random().toString(36).substring(2, 9)}`;

  // Combine custom toolbar config with defaults
  const modules = {
    ...DEFAULT_MODULES,
    ...(toolbarConfig ? { toolbar: toolbarConfig } : {}),
    ...(showToolbar ? {} : { toolbar: false })
  };

  // Initialize with sanitized value
  useEffect(() => {
    setEditorValue(value || '');
    setCharCount((value || '').length);
  }, [value]);

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      quillRef.current?.focus();
    },
    blur: () => {
      quillRef.current?.blur();
    },
    getSelection: (): TextSelection | null => {
      const editor = quillRef.current?.getEditor();
      const selection = editor?.getSelection();
      if (!selection) return null;
      
      return {
        index: selection.index,
        length: selection.length,
        text: editor?.getText(selection.index, selection.length) || ''
      };
    },
    setSelection: (index: number, length: number) => {
      quillRef.current?.getEditor().setSelection(index, length);
    },
    getContents: () => {
      return quillRef.current?.getEditor().getText() || '';
    },
    getLength: () => {
      return quillRef.current?.getEditor().getLength() || 0;
    },
    getFormat: (): TextFormat => {
      const editor = quillRef.current?.getEditor();
      const selection = editor?.getSelection();
      if (!selection) return {};
      return editor?.getFormat(selection) as TextFormat || {};
    },
    setFormat: (format: TextFormat) => {
      const editor = quillRef.current?.getEditor();
      const selection = editor?.getSelection();
      if (!selection) return;
      
      // Apply each format property individually
      Object.entries(format).forEach(([key, value]) => {
        if (value !== undefined) {
          editor?.format(key as string, value);
        }
      });
    }
  }));

  const handleChange = (content: string) => {
    // Check max length
    if (maxLength && content.length > maxLength) {
      content = content.slice(0, maxLength);
    }
    
    // Always sanitize content to prevent XSS vulnerabilities
    // Even if sanitize is false, we use sanitizeRichText for security
    const sanitizedContent = sanitizeRichText(content);
    setEditorValue(sanitizedContent);
    setCharCount(sanitizedContent.length);
    onChange(sanitizedContent);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
    
    // Check for max length if approaching limit
    if (maxLength && charCount >= maxLength - 10) {
      const editor = quillRef.current?.getEditor();
      const length = editor?.getLength() || 0;
      
      if (length >= maxLength && !event.metaKey && !event.ctrlKey && event.key !== 'Backspace' && event.key !== 'Delete') {
        event.preventDefault();
      }
    }
  };

  // Apply accessibility settings
  const accessibilityClasses = accessibility ? cn(
    accessibility.highContrast && 'high-contrast',
    accessibility.largerText && 'larger-text',
    accessibility.keyboardNavigation && 'enhanced-keyboard-nav'
  ) : '';

  return (
    <div className={cn("rich-text-editor-container space-y-2", className, accessibilityClasses, error ? "has-error" : "")}>
      {label && (
        <Label htmlFor={uniqueId} className="block mb-2 font-medium">
          {label}
          {error && <span className="sr-only"> (Error: {error})</span>}
        </Label>
      )}
      
      <div 
        className={cn(
          "border rounded-md overflow-hidden", 
          error ? "border-red-500" : "border-input",
          readOnly ? "bg-muted opacity-70" : ""
        )}
        style={{ height }}
      >
        <ReactQuill
          ref={quillRef}
          id={uniqueId}
          value={editorValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          modules={modules}
          formats={DEFAULT_FORMATS}
          theme={theme}
          className="h-full"
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-errormessage={error ? `${uniqueId}-error` : undefined}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        {showCharCount && (
          <div>
            {charCount} {maxLength ? `/ ${maxLength}` : ''} characters
            {maxLength && charCount > maxLength && (
              <span className="text-red-500 ml-2">(Exceeds maximum length)</span>
            )}
          </div>
        )}
        
        {!showCharCount && maxLength && (
          <div className={charCount > maxLength ? "text-red-500" : ""}>
            {charCount} / {maxLength}
            {charCount > maxLength && <span className="ml-2">(Exceeds maximum length)</span>}
          </div>
        )}
        
        {error && (
          <p id={`${uniqueId}-error`} className="text-sm text-red-500 mt-1 font-semibold" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
