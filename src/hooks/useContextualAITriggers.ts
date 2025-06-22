
import { useEffect } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useTypingActivityTracker } from './contextual-ai/useTypingActivityTracker';
import { useContextualWritingAssistant } from './contextual-ai/useContextualWritingAssistant';

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
    activeTriggers,
    dialogueContext,
    writingBlocks,
    userActivity,
    processAllContextualTriggers,
    dismissTrigger
  } = useContextualWritingAssistant(state.characters, onTriggerSuggestion);

  // Enhanced contextual analysis with intelligent triggers
  useEffect(() => {
    if (!textareaRef.current || !debouncedContent) return;
    
    const cursorPos = textareaRef.current.selectionStart || 0;
    
    // Process all contextual triggers with enhanced intelligence
    processAllContextualTriggers(debouncedContent, cursorPos, isTyping, lastTypingTime);
  }, [debouncedContent, processAllContextualTriggers, isTyping, lastTypingTime]);

  return {
    // Enhanced triggers
    activeTriggers,
    dialogueContext,
    writingBlocks,
    userActivity,
    
    // Activity tracking
    isTyping,
    handleTypingActivity,
    
    // Controls
    dismissTrigger
  };
};
