import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useEditorState } from '@/hooks/useEditorState';
import { useTextSelection } from '@/hooks/useTextSelection';
import InlineAISuggestions from '@/components/ai/InlineAISuggestions';
import AIAssistantOverlay from '@/components/ai/AIAssistantOverlay';
import ProactiveWritingSupport from '@/components/ai/ProactiveWritingSupport';
import SuggestionsPanel from '@/components/ai/SuggestionsPanel';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorTextarea, { EditorTextareaRef } from '@/components/editor/EditorTextarea';
import EditorFooter from '@/components/editor/EditorFooter';
import FloatingActionButtons from '@/components/editor/FloatingActionButtons';

const EnhancedEditor = () => {
  const textareaRef = useRef<EditorTextareaRef>(null);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  const {
    currentDocument,
    showProactivePanel,
    setShowProactivePanel,
    proactiveEnabled,
    setProactiveEnabled,
    textBeforeCursor,
    textAfterCursor,
    cursorPosition,
    setCursorPosition,
    showFloatingActions,
    setShowFloatingActions,
    handleContentChange
  } = useEditorState();

  const {
    selectedText,
    selectionPosition,
    showInlineSuggestions,
    setShowInlineSuggestions,
    setSelectedText,
    handleTextSelection
  } = useTextSelection();

  const {
    suggestions,
    improveSelectedText,
    generateTextCompletion,
    dismissSuggestion
  } = useCollaborativeAI();

  // Enable auto-save
  useAutoSave();

  const handleTextSelectionWrapper = useCallback(() => {
    if (!textareaRef.current) return;
    const textarea = {
      value: textareaRef.current.value,
      selectionStart: textareaRef.current.selectionStart,
      selectionEnd: textareaRef.current.selectionEnd,
      getBoundingClientRect: () => textareaRef.current!.getBoundingClientRect()
    } as HTMLTextAreaElement;
    
    handleTextSelection(textarea, setCursorPosition, setShowFloatingActions);
  }, [handleTextSelection, setCursorPosition, setShowFloatingActions]);

  const handleApplyAISuggestion = useCallback((newText: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentContent = currentDocument.content || '';
    
    const newContent = currentContent.substring(0, start) + newText + currentContent.substring(end);
    
    // Update content directly using the change handler
    const syntheticEvent = {
      target: { value: newContent, selectionStart: start + newText.length }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChange(syntheticEvent);
    
    setShowInlineSuggestions(false);
    setSelectedText('');
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  }, [currentDocument, handleContentChange, setShowInlineSuggestions, setSelectedText]);

  const handleTextCompletion = useCallback((completion: string) => {
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const currentContent = currentDocument.content || '';
    
    const newContent = currentContent.slice(0, cursorPos) + completion + currentContent.slice(cursorPos);
    
    const syntheticEvent = {
      target: { value: newContent, selectionStart: cursorPos + completion.length }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChange(syntheticEvent);
    
    // Set cursor after the completion
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursorPos + completion.length, cursorPos + completion.length);
    }, 0);
  }, [currentDocument, handleContentChange]);

  const handleQuickAIAction = useCallback(async (action: 'improve' | 'continue') => {
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = textareaRef.current.value.slice(Math.max(0, cursorPos - 100), cursorPos);
    
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
              const newContent = textareaRef.current.value.slice(0, Math.max(0, cursorPos - 100)) + 
                                improvement.text + 
                                textareaRef.current.value.slice(cursorPos);
              
              const syntheticEvent = {
                target: { value: newContent, selectionStart: cursorPos }
              } as React.ChangeEvent<HTMLTextAreaElement>;
              handleContentChange(syntheticEvent);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Quick AI action failed:', error);
    }
    
    setShowFloatingActions(false);
  }, [currentDocument, generateTextCompletion, textAfterCursor, improveSelectedText, handleContentChange, handleTextCompletion, setShowFloatingActions]);

  const handleApplySuggestionFromPanel = useCallback((suggestion: any) => {
    // Apply the suggestion text at the current cursor position
    if (!textareaRef.current || !currentDocument) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const currentContent = currentDocument.content || '';
    
    let newContent = '';
    if (suggestion.original) {
      // Replace original text with suggested text
      newContent = currentContent.replace(suggestion.original, suggestion.text);
    } else {
      // Insert suggestion at cursor position
      newContent = currentContent.slice(0, cursorPos) + suggestion.text + currentContent.slice(cursorPos);
    }
    
    const syntheticEvent = {
      target: { value: newContent, selectionStart: cursorPos + suggestion.text.length }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleContentChange(syntheticEvent);
    
    // Dismiss the suggestion after applying
    dismissSuggestion(suggestion.id);
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [currentDocument, handleContentChange, dismissSuggestion]);

  // Update cursor position on scroll or resize
  useEffect(() => {
    const handleUpdate = () => {
      if (showFloatingActions && textareaRef.current) {
        // This would need to be implemented in the hook for proper cursor tracking
      }
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [showFloatingActions]);

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
        <EditorHeader
          title={currentDocument.title}
          suggestionsCount={suggestions.length}
          showProactivePanel={showProactivePanel}
          onToggleProactivePanel={() => setShowProactivePanel(!showProactivePanel)}
          onToggleSuggestions={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
        />
        
        <EditorTextarea
          ref={textareaRef}
          content={currentDocument.content || ''}
          textBeforeCursor={textBeforeCursor}
          textAfterCursor={textAfterCursor}
          onChange={handleContentChange}
          onTextSelection={handleTextSelectionWrapper}
          onTextCompletion={handleTextCompletion}
        />
        
        <FloatingActionButtons
          show={showFloatingActions}
          position={cursorPosition}
          onContinue={() => handleQuickAIAction('continue')}
          onImprove={() => handleQuickAIAction('improve')}
        />
        
        <EditorFooter wordCount={currentDocument.wordCount || 0} />
      </div>

      {/* AI Suggestions Panel */}
      <SuggestionsPanel
        suggestions={suggestions}
        isVisible={showSuggestionsPanel}
        onClose={() => setShowSuggestionsPanel(false)}
        onApplySuggestion={handleApplySuggestionFromPanel}
        onDismissSuggestion={dismissSuggestion}
      />

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
