import React, { useState, useRef } from 'react';
import { RichTextEditor } from '@/components/ui';
import { EditorMethods } from '@/types/editor';
import { ContentFormat } from '@/types/document';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const RichTextEditorExample = () => {
  const [content, setContent] = useState<string>('<p>Hello world! This is a <strong>rich text</strong> editor example.</p>');
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [format, setFormat] = useState<ContentFormat>(ContentFormat.RICH_TEXT);
  const [error, setError] = useState<string>('');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  
  const editorRef = useRef<EditorMethods>(null);
  
  const handleChange = (value: string) => {
    setContent(value);
    // Clear any errors when the user starts editing
    if (error) setError('');
  };
  
  const handleBoldClick = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (selection && selection.length > 0) {
        editorRef.current.setFormat({ bold: true });
      } else {
        setError('Please select some text to format.');
      }
    }
  };
  
  const handleClearClick = () => {
    setContent('');
  };
  
  const handleFocusClick = () => {
    editorRef.current?.focus();
  };
  
  const handleToggleReadOnly = () => {
    setReadOnly(!readOnly);
  };
  
  const handleToggleFormat = () => {
    setFormat(format === ContentFormat.RICH_TEXT ? ContentFormat.MARKDOWN : ContentFormat.RICH_TEXT);
  };
  
  const handleToggleHighContrast = () => {
    setHighContrast(!highContrast);
  };
  
  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Rich Text Editor Example</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="read-only" 
              checked={readOnly} 
              onCheckedChange={handleToggleReadOnly} 
            />
            <Label htmlFor="read-only">Read Only</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="format" 
              checked={format === ContentFormat.MARKDOWN} 
              onCheckedChange={handleToggleFormat} 
            />
            <Label htmlFor="format">
              {format === ContentFormat.MARKDOWN ? 'Markdown' : 'Rich Text'}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="high-contrast" 
              checked={highContrast} 
              onCheckedChange={handleToggleHighContrast} 
            />
            <Label htmlFor="high-contrast">High Contrast</Label>
          </div>
        </div>
        
        <RichTextEditor
          ref={editorRef}
          value={content}
          onChange={handleChange}
          label="Document Content"
          placeholder="Start writing..."
          readOnly={readOnly}
          error={error}
          format={format}
          showCharCount={true}
          maxLength={1000}
          accessibility={{
            highContrast: highContrast,
            largerText: false,
            keyboardNavigation: true
          }}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          <Button onClick={handleBoldClick} className="mr-2">Bold Selected Text</Button>
          <Button onClick={handleFocusClick} variant="outline" className="mr-2">Focus Editor</Button>
        </div>
        <Button onClick={handleClearClick} variant="destructive">Clear</Button>
      </CardFooter>
    </Card>
  );
};

export default RichTextEditorExample;
