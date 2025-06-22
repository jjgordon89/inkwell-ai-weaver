
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useDebounce } from '@/hooks/useDebounce';

interface WritingBlock {
  type: 'pause' | 'repetition' | 'incomplete_sentence';
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  position: number;
}

interface DialogueContext {
  isInDialogue: boolean;
  currentCharacter?: string;
  availableCharacters: string[];
}

export const useContextualAITriggers = (
  textareaRef: React.RefObject<any>,
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const { state } = useWriting();
  const { currentDocument } = state;
  const { generateTextCompletion } = useCollaborativeAI();
  
  const [writingBlocks, setWritingBlocks] = useState<WritingBlock[]>([]);
  const [dialogueContext, setDialogueContext] = useState<DialogueContext>({
    isInDialogue: false,
    availableCharacters: []
  });
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const content = currentDocument?.content || '';
  const debouncedContent = useDebounce(content, 1000);

  // Detect if user has stopped typing
  const handleTypingActivity = useCallback(() => {
    setIsTyping(true);
    setLastTypingTime(Date.now());
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000); // 3 seconds of inactivity = stopped typing
  }, []);

  // Detect writing blocks when user stops typing
  const detectWritingBlocks = useCallback((text: string, cursorPos: number) => {
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
  }, [isTyping, lastTypingTime, onTriggerSuggestion]);

  // Detect dialogue context
  const detectDialogueContext = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    const previousLines = lines.slice(-5, -1); // Look at last 5 lines for context
    
    // Check if we're in dialogue (quotes, dialogue tags, etc.)
    const isInDialogue = /["'"]/.test(currentLine) || 
                        currentLine.includes(' said') ||
                        currentLine.includes(' asked') ||
                        currentLine.includes(' replied') ||
                        /^\s*["'"]/.test(currentLine);
    
    // Extract character names from recent text
    const characterNames = state.characters.map(c => c.name);
    let currentCharacter: string | undefined;
    
    if (isInDialogue) {
      // Look for character names in previous lines
      for (const line of [...previousLines].reverse()) {
        for (const charName of characterNames) {
          if (line.toLowerCase().includes(charName.toLowerCase())) {
            currentCharacter = charName;
            break;
          }
        }
        if (currentCharacter) break;
      }
    }
    
    setDialogueContext({
      isInDialogue,
      currentCharacter,
      availableCharacters: characterNames
    });
    
    // Generate character-aware suggestions for dialogue
    if (isInDialogue && currentCharacter) {
      const character = state.characters.find(c => c.name === currentCharacter);
      if (character && character.personality) {
        const suggestion = `Writing as ${currentCharacter} (${character.personality}) - consider their unique voice and mannerisms`;
        onTriggerSuggestion(suggestion, 'character_dialogue');
      }
    }
  }, [state.characters, onTriggerSuggestion]);

  // Analyze document structure for smart suggestions
  const analyzeDocumentStructure = useCallback((text: string) => {
    if (text.length < 200) return;
    
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const averageParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
    
    // Detect if paragraphs are getting too long
    if (averageParagraphLength > 500) {
      onTriggerSuggestion('Consider breaking up long paragraphs for better readability', 'structure_paragraphs');
    }
    
    // Detect lack of dialogue in story
    const dialogueCount = (text.match(/["'"]/g) || []).length;
    const wordCount = text.split(/\s+/).length;
    const dialogueRatio = dialogueCount / wordCount;
    
    if (wordCount > 500 && dialogueRatio < 0.02) {
      onTriggerSuggestion('Consider adding dialogue to bring your characters to life', 'structure_dialogue');
    }
  }, [onTriggerSuggestion]);

  // Main effect to trigger analysis
  useEffect(() => {
    if (!textareaRef.current || !debouncedContent) return;
    
    const cursorPos = textareaRef.current.selectionStart || 0;
    
    detectWritingBlocks(debouncedContent, cursorPos);
    detectDialogueContext(debouncedContent, cursorPos);
    analyzeDocumentStructure(debouncedContent);
  }, [debouncedContent, detectWritingBlocks, detectDialogueContext, analyzeDocumentStructure]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    writingBlocks,
    dialogueContext,
    isTyping,
    handleTypingActivity
  };
};
