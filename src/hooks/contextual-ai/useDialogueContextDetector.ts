
import { useState, useCallback } from 'react';
import type { DialogueContext } from './types';

export const useDialogueContextDetector = (
  characters: Array<{ name: string; personality?: string }>,
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const [dialogueContext, setDialogueContext] = useState<DialogueContext>({
    isInDialogue: false,
    availableCharacters: []
  });

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
    const characterNames = characters.map(c => c.name);
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
      const character = characters.find(c => c.name === currentCharacter);
      if (character && character.personality) {
        const suggestion = `Writing as ${currentCharacter} (${character.personality}) - consider their unique voice and mannerisms`;
        onTriggerSuggestion(suggestion, 'character_dialogue');
      }
    }
  }, [characters, onTriggerSuggestion]);

  return {
    dialogueContext,
    detectDialogueContext
  };
};
