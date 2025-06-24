
import React, { useRef } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useAI } from '@/hooks/useAI';
import EditorMainLayout from './EditorMainLayout';
import { EditorTextareaRef } from './EditorTextarea';
import { useToast } from "@/hooks/use-toast";

const EditorContainer = () => {
  const {
    currentDocument,
    showProactivePanel,
    setShowProactivePanel,
    textBeforeCursor,
    textAfterCursor,
    cursorPosition,
    showFloatingActions,
    handleContentChange
  } = useEditorState();

  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { suggestions } = useCollaborativeAI();
  const { processText, isCurrentProviderConfigured } = useAI();
  const { toast } = useToast();
  const textareaRef = useRef<EditorTextareaRef>(null);

  const handleTextSelection = () => {
    // Handle text selection logic
  };

  const handleTextCompletion = (completion: string) => {
    if (currentDocument && textareaRef.current) {
      const currentContent = currentDocument.content || '';
      const cursorPos = textareaRef.current.selectionStart;
      const newContent = currentContent.slice(0, cursorPos) + completion + currentContent.slice(cursorPos);
      
      // Simulate change event to update content
      const syntheticEvent = {
        target: { value: newContent }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      handleContentChange(syntheticEvent);
      
      // Move cursor to end of inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = cursorPos + completion.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleToggleSuggestions = () => {
    // Toggle suggestions logic
  };

  const handleQuickAIAction = async (action: 'continue' | 'improve') => {
    if (!currentDocument || !isCurrentProviderConfigured()) {
      toast({
        title: "AI Not Available",
        description: "Please configure an AI provider first",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = currentDocument.content || '';
      const contextText = action === 'continue' ? content.slice(-200) : content;
      const result = await processText(contextText, action);
      
      if (result && result.trim()) {
        const newContent = action === 'continue' 
          ? content + ' ' + result.trim()
          : result.trim();
        
        const syntheticEvent = {
          target: { value: newContent }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        handleContentChange(syntheticEvent);
        
        toast({
          title: `AI ${action === 'continue' ? 'Continuation' : 'Improvement'} Applied`,
          description: "Your text has been updated",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('AI action failed:', error);
      toast({
        title: "AI Action Failed",
        description: error instanceof Error ? error.message : "Could not process text",
        variant: "destructive"
      });
    }
  };

  if (!currentDocument) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">No Document Selected</h2>
          <p className="text-muted-foreground">Select a document from the sidebar to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <EditorMainLayout
      currentDocument={currentDocument}
      textareaRef={textareaRef}
      textBeforeCursor={textBeforeCursor}
      textAfterCursor={textAfterCursor}
      cursorPosition={cursorPosition}
      showFloatingActions={showFloatingActions}
      suggestions={suggestions}
      showProactivePanel={showProactivePanel}
      onToggleProactivePanel={() => setShowProactivePanel(!showProactivePanel)}
      onToggleSuggestions={handleToggleSuggestions}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      onContentChange={handleContentChange}
      onTextSelection={handleTextSelection}
      onTextCompletion={handleTextCompletion}
      onQuickAIAction={handleQuickAIAction}
    />
  );
};

export default EditorContainer;
