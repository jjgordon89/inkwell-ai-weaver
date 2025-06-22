
import { useState, useCallback } from 'react';
import type { WritingBlock } from './types';

export const useWritingBlockDetector = (
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const [writingBlocks, setWritingBlocks] = useState<WritingBlock[]>([]);

  const detectWritingBlocks = useCallback((
    text: string, 
    cursorPos: number, 
    isTyping: boolean, 
    lastTypingTime: number
  ) => {
    const blocks: WritingBlock[] = [];
    
    // Check for long pause without progress
    if (!isTyping && text.length > 50) {
      const recentText = text.slice(Math.max(0, cursorPos - 100), cursorPos);
      const sentences = recentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length > 0) {
        const lastSentence = sentences[sentences.length - 1].trim();
        
        // Incomplete sentence detection
        if (lastSentence.length > 10 && !lastSentence.match(/[.!?]$/)) {
          blocks.push({
            type: 'incomplete_sentence',
            severity: 'medium',
            suggestion: 'Complete your current thought or start a new sentence',
            position: cursorPos
          });
        }
        
        // Repetitive word detection
        const words = lastSentence.toLowerCase().split(/\s+/);
        const wordCounts = words.reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const repeatedWords = Object.entries(wordCounts).filter(([word, count]) => 
          count > 2 && word.length > 3
        );
        
        if (repeatedWords.length > 0) {
          blocks.push({
            type: 'repetition',
            severity: 'low',
            suggestion: `Avoid repeating "${repeatedWords[0][0]}" - try varying your word choice`,
            position: cursorPos
          });
        }
      }
      
      // Long pause detection
      const timeSinceLastType = Date.now() - lastTypingTime;
      if (timeSinceLastType > 10000) { // 10 seconds
        blocks.push({
          type: 'pause',
          severity: 'high',
          suggestion: 'Take a moment to continue your story - would you like AI assistance?',
          position: cursorPos
        });
      }
    }
    
    setWritingBlocks(blocks);
    
    // Trigger suggestion for high severity blocks
    blocks.forEach(block => {
      if (block.severity === 'high') {
        onTriggerSuggestion(block.suggestion, `writing_block_${block.type}`);
      }
    });
  }, [onTriggerSuggestion]);

  return {
    writingBlocks,
    detectWritingBlocks
  };
};
