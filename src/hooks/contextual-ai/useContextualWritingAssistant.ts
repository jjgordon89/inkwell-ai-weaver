
import { useCallback } from 'react';
import { useIntelligentTriggers } from './useIntelligentTriggers';
import { useSmartDialogueDetector } from './useSmartDialogueDetector';
import { useWritingBlockDetector } from './useWritingBlockDetector';
import { useDocumentStructureAnalyzer } from './useDocumentStructureAnalyzer';

export const useContextualWritingAssistant = (
  characters: Array<{ name: string; personality?: string }>,
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const {
    activeTriggers,
    processIntelligentTriggers,
    dismissTrigger,
    userActivity
  } = useIntelligentTriggers(onTriggerSuggestion);

  const {
    dialogueContext,
    analyzeDialogueContext
  } = useSmartDialogueDetector(characters, onTriggerSuggestion);

  const {
    writingBlocks,
    detectWritingBlocks
  } = useWritingBlockDetector(onTriggerSuggestion);

  const {
    analyzeDocumentStructure
  } = useDocumentStructureAnalyzer(onTriggerSuggestion);

  const processAllContextualTriggers = useCallback((
    text: string,
    cursorPos: number,
    isTyping: boolean,
    lastTypingTime: number
  ) => {
    // Run all contextual analyses
    processIntelligentTriggers(text, cursorPos, isTyping);
    analyzeDialogueContext(text, cursorPos);
    detectWritingBlocks(text, cursorPos, isTyping, lastTypingTime);
    analyzeDocumentStructure(text);
  }, [
    processIntelligentTriggers,
    analyzeDialogueContext,
    detectWritingBlocks,
    analyzeDocumentStructure
  ]);

  return {
    // Combined state
    activeTriggers,
    dialogueContext,
    writingBlocks,
    userActivity,
    
    // Main processing function
    processAllContextualTriggers,
    
    // Individual controls
    dismissTrigger
  };
};
