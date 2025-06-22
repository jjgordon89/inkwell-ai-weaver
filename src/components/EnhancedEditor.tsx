import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import SmartTextCompletion from '@/components/ai/SmartTextCompletion';
import InlineAISuggestions from '@/components/ai/InlineAISuggestions';
import AIAssistantOverlay from '@/components/ai/AIAssistantOverlay';
import ProactiveWritingSupport from '@/components/ai/ProactiveWritingSupport';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Brain, Zap, Check, Sidebar } from 'lucide-react';

interface CursorPosition {
  x: number;
  y: number;
}

const EnhancedEditor = () => {
  const { state, dispatch } = useWriting();
  const { currentDocument } = state;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [textBeforeCursor, setTextBeforeCursor] = useState('');
  const [textAfterCursor, setTextAfterCursor] = useState('');
  const [showProactivePanel, setShowProactivePanel] = useState(false);
  const [proactiveEnabled, setProactiveEnabled] = useState(true);

  const {
    suggestions,
    improveSelectedText,
    generateTextCompletion,
    updateContext
  } = useCollaborativeAI();

  // Enable auto-save
  useAutoSave();

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentDocument) {
      const newContent = e.target.value;
      dispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: currentDocument.id,
          content: newContent
        }
      });

      // Update AI context
      updateContext({
        currentText: newContent,
        cursorPosition: e.target.selectionStart,
        selectedText: '',
        characters: state.characters.map(c => c.name)
      });

      // Update cursor context for smart completion
      const cursorPos = e.target.selectionStart;
      setTextBeforeCursor(newContent.slice(0, cursorPos));
      setTextAfterCursor(newContent.slice(cursorPos));
    }
  }, [currentDocument, dispatch, updateContext, state.characters]);

  const getCursorCoordinates = useCallback((textarea: HTMLTextAreaElement, position: number): CursorPosition => {
    // Create a dummy div to measure text
    const div = document.createElement('div');
    const style = window.getComputedStyle(textarea);
    
    // Copy textarea styles to div
    ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'padding', 'border'].forEach(prop => {
      div.style[prop as any] = style[prop as any];
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.width = textarea.clientWidth + 'px';
    
    document.body.appendChild(div);
    
    const textBeforePosition = textarea.value.substring(0, position);
    div.textContent = textBeforePosition;
    
    const span = document.createElement('span');
    span.textContent = '|';
    div.appendChild(span);
    
    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    return {
      x: spanRect.left - rect.left + textarea.scrollLeft,
      y: spanRect.top - rect.top + textarea.scrollTop
    };
  }, []);

  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const hasSelection = selection.trim().length > 0;
    
    setSelectedText(hasSelection ? selection.trim() : '');
    
    if (hasSelection) {
      const position = getCursorCoordinates(textarea, textarea.selectionStart);
      setSelectionPosition({
        x: position.x + textarea.getBoundingClientRect().left,
        y: position.y + textarea.getBoundingClientRect().top - 60
      });
      setShowInlineSuggestions(true);
      setShowFloatingActions(false);
    } else {
      setShowInlineSuggestions(false);
      
      // Show floating actions for cursor position if there's content around
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.slice(Math.max(0, cursorPos - 50), cursorPos);
      const textAfter = textarea.value.slice(cursorPos, cursorPos + 50);
      
      if (textBefore.trim() || textAfter.trim()) {
        const position = getCursorCoordinates(textarea, cursorPos);
        setCursorPosition({
          x: position.x + textarea.getBoundingClientRect().left,
          y: position.y + textarea.getBoundingClientRect().top - 40
        });
        setShowFloatingActions(true);
        
        // Auto-hide after 3 seconds
        setTimeout(() => setShowFloatingActions(false), 3000);
      }
    }
    
    // Update selected text in context
    dispatch({ type: 'SET_SELECTED_TEXT', payload: hasSelection ? selection.trim() : '' });
  }, [getCursorCoordinates, dispatch]);

  const handleApplyAISuggestion = useCallback((newText: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = currentDocument.content || '';
    
    const newContent = currentContent.substring(0, start) + newText + currentContent.substring(end);
    
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: currentDocument.id,
        content: newContent
      }
    });
    
    setShowInlineSuggestions(false);
    setSelectedText('');
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  }, [currentDocument, dispatch]);

  const handleTextCompletion = useCallback((completion: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const currentContent = currentDocument.content || '';
    
    const newContent = currentContent.slice(0, cursorPos) + completion + currentContent.slice(cursorPos);
    
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: currentDocument.id,
        content: newContent
      }
    });
    
    // Set cursor after the completion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + completion.length, cursorPos + completion.length);
    }, 0);
  }, [currentDocument, dispatch]);

  const handleQuickAIAction = useCallback(async (action: 'improve' | 'continue' | 'rephrase') => {
    if (!textareaRef.current || !currentDocument) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.slice(Math.max(0, cursorPos - 100), cursorPos);
    
    try {
      let result = '';
      switch (action) {
        case 'continue':
          result = await generateTextCompletion(textBefore, textAfterCursor) || '';
          if (result) handleTextCompletion(' ' + result);
          break;
        case 'improve':
          if (textBefore.trim()) {
            const improvement = await improveSelectedText(textBefore.trim());
            if (improvement) {
              // Replace the text before cursor with improved version
              const newContent = textarea.value.slice(0, Math.max(0, cursorPos - 100)) + 
                                improvement.text + 
                                textarea.value.slice(cursorPos);
              
              dispatch({
                type: 'UPDATE_DOCUMENT_CONTENT',
                payload: {
                  id: currentDocument.id,
                  content: newContent
                }
              });
            }
          }
          break;
      }
    } catch (error) {
      console.error('Quick AI action failed:', error);
    }
    
    setShowFloatingActions(false);
  }, [currentDocument, dispatch, generateTextCompletion, textAfterCursor, improveSelectedText]);

  // Update cursor position on scroll or resize
  useEffect(() => {
    const handleUpdate = () => {
      if (showFloatingActions && textareaRef.current) {
        const textarea = textareaRef.current;
        const position = getCursorCoordinates(textarea, textarea.selectionStart);
        setCursorPosition({
          x: position.x + textarea.getBoundingClientRect().left,
          y: position.y + textarea.getBoundingClientRect().top - 40
        });
      }
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [showFloatingActions, getCursorCoordinates]);

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background relative">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{currentDocument.title}</h2>
          <div className="text-xs text-muted-foreground flex items-center gap-4">
            <span>Auto-save enabled</span>
            {suggestions.length > 0 && (
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {suggestions.length} AI suggestions
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProactivePanel(!showProactivePanel)}
              className="flex items-center gap-1"
            >
              <Sidebar className="h-3 w-3" />
              Writing Assistant
            </Button>
          </div>
        </div>
        
        <div className="flex-grow p-8 md:p-12 lg:p-16 relative">
          <textarea
            ref={textareaRef}
            value={currentDocument.content || ''}
            onChange={handleContentChange}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onSelect={handleTextSelection}
            className="w-full max-w-3xl mx-auto h-full resize-none bg-transparent focus:outline-none font-serif text-lg leading-relaxed text-foreground"
            placeholder="Start writing your story... (AI assistance is active)"
          />
          
          {/* Smart Text Completion */}
          {textBeforeCursor && (
            <SmartTextCompletion
              textBefore={textBeforeCursor}
              textAfter={textAfterCursor}
              cursorPosition={textareaRef.current?.selectionStart || 0}
              onAccept={handleTextCompletion}
              onDismiss={() => {}}
              isEnabled={true}
            />
          )}
          
          {/* Floating Action Buttons */}
          {showFloatingActions && (
            <div
              className="absolute z-40 flex items-center gap-1 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-lg"
              style={{
                left: Math.min(cursorPosition.x, window.innerWidth - 200),
                top: Math.max(cursorPosition.y - 40, 10)
              }}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAIAction('continue')}
                className="h-6 px-2 text-xs"
                title="Continue writing"
              >
                <Zap className="h-3 w-3 mr-1" />
                Continue
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAIAction('improve')}
                className="h-6 px-2 text-xs"
                title="Improve previous text"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Improve
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t text-right text-sm text-muted-foreground">
          {currentDocument.wordCount || 0} Words
        </div>
      </div>

      {/* Proactive Writing Support Panel */}
      {showProactivePanel && (
        <div className="w-80 border-l bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <ProactiveWritingSupport
              isEnabled={proactiveEnabled}
              onToggle={() => setProactiveEnabled(!proactiveEnabled)}
            />
          </div>
        </div>
      )}
      
      {/* Inline AI Suggestions for Selected Text */}
      {showInlineSuggestions && selectedText && (
        <InlineAISuggestions
          selectedText={selectedText}
          onApply={handleApplyAISuggestion}
          onDismiss={() => {
            setShowInlineSuggestions(false);
            setSelectedText('');
          }}
          position={selectionPosition}
          documentContent={currentDocument.content || ''}
        />
      )}
      
      {/* AI Assistant Overlay */}
      <AIAssistantOverlay />
    </div>
  );
};

export default EnhancedEditor;
