
import { useEffect } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useTypingActivityTracker } from './contextual-ai/useTypingActivityTracker';
import { useWritingBlockDetector } from './contextual-ai/useWritingBlockDetector';
import { useDialogueContextDetector } from './contextual-ai/useDialogueContextDetector';
import { useDocumentStructureAnalyzer } from './contextual-ai/useDocumentStructureAnalyzer';

export const useContextualAITriggers = (
  textareaRef: React.RefObject<any>,
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const { state } = useWriting();
  const { currentDocument } = state;
  
  const content = currentDocument?.content || '';
  const debouncedContent = useDebounce(content, 1000);

  const {
    isTyping,
    lastTypingTime,
    handleTypingActivity
  } = useTypingActivityTracker();

  const {
    writingBlocks,
    detectWritingBlocks
  } = useWritingBlockDetector(onTriggerSuggestion);

  const {
    dialogueContext,
    detectDialogueContext
  } = useDialogueContextDetector(state.characters, onTriggerSuggestion);

  const {
    analyzeDocumentStructure
  } = useDocumentStructureAnalyzer(onTriggerSuggestion);

  // Main effect to trigger analysis
  useEffect(() => {
    if (!textareaRef.current || !debouncedContent) return;
    
    const cursorPos = textareaRef.current.selectionStart || 0;
    
    detectWritingBlocks(debouncedContent, cursorPos, isTyping, lastTypingTime);
    detectDialogueContext(debouncedContent, cursorPos);
    analyzeDocumentStructure(debouncedContent);
  }, [debouncedContent, detectWritingBlocks, detectDialogueContext, analyzeDocumentStructure, isTyping, lastTypingTime]);

  return {
    writingBlocks,
    dialogueContext,
    isTyping,
    handleTypingActivity
  };
};
