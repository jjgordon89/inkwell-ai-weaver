
import { useState, useCallback } from 'react';

interface DialogueContext {
  isInDialogue: boolean;
  currentCharacter?: string;
  dialogueQuality: 'good' | 'needs_improvement' | 'missing';
  suggestedImprovements: string[];
}

export const useSmartDialogueDetector = (
  characters: Array<{ name: string; personality?: string }>,
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const [dialogueContext, setDialogueContext] = useState<DialogueContext>({
    isInDialogue: false,
    dialogueQuality: 'missing',
    suggestedImprovements: []
  });

  const analyzeDialogueContext = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const recentText = beforeCursor.slice(-300); // Analyze last 300 characters
    
    // Enhanced dialogue detection
    const dialogueMarkers = ['"', "'", '"', '"'];
    const hasDialogue = dialogueMarkers.some(marker => recentText.includes(marker));
    
    // Detect dialogue tags and patterns
    const dialogueTags = [
      /\b(said|asked|replied|shouted|whispered|murmured|declared|exclaimed)\b/gi,
      /\b(he|she|they)\s+(said|asked|replied)/gi
    ];
    
    const hasDialogueTags = dialogueTags.some(pattern => pattern.test(recentText));
    
    // Character voice analysis
    let currentCharacter: string | undefined;
    let dialogueQuality: DialogueContext['dialogueQuality'] = 'missing';
    const suggestedImprovements: string[] = [];
    
    if (hasDialogue) {
      dialogueQuality = 'good';
      
      // Find current speaker
      const characterNames = characters.map(c => c.name);
      for (const charName of characterNames) {
        if (recentText.toLowerCase().includes(charName.toLowerCase())) {
          currentCharacter = charName;
          break;
        }
      }
      
      // Analyze dialogue quality
      const dialogueLines = recentText.split(/["'""]/).filter((line, index) => index % 2 === 1);
      
      if (dialogueLines.length > 0) {
        const lastDialogue = dialogueLines[dialogueLines.length - 1];
        
        // Check for dialogue issues
        if (lastDialogue.length > 100) {
          suggestedImprovements.push('Consider breaking up long dialogue lines');
          dialogueQuality = 'needs_improvement';
        }
        
        if (!hasDialogueTags && dialogueLines.length > 2) {
          suggestedImprovements.push('Add dialogue tags to clarify who is speaking');
          dialogueQuality = 'needs_improvement';
        }
        
        // Character-specific voice consistency
        if (currentCharacter) {
          const character = characters.find(c => c.name === currentCharacter);
          if (character?.personality) {
            const isConsistent = checkVoiceConsistency(lastDialogue, character.personality);
            if (!isConsistent) {
              suggestedImprovements.push(`Ensure dialogue matches ${currentCharacter}'s personality`);
              dialogueQuality = 'needs_improvement';
            }
          }
        }
      }
    } else {
      // Check if dialogue is missing when it should be present
      const narrativeLength = recentText.replace(/[.!?]/g, '').length;
      const characterMentions = characters.filter(c => 
        recentText.toLowerCase().includes(c.name.toLowerCase())
      ).length;
      
      if (narrativeLength > 200 && characterMentions > 1) {
        suggestedImprovements.push('Consider adding dialogue between characters');
        onTriggerSuggestion('Add dialogue to make character interactions more engaging', 'smart_dialogue_missing');
      }
    }
    
    setDialogueContext({
      isInDialogue: hasDialogue,
      currentCharacter,
      dialogueQuality,
      suggestedImprovements
    });
    
    // Trigger character-specific suggestions
    if (currentCharacter && dialogueQuality === 'needs_improvement') {
      onTriggerSuggestion(
        `Enhance ${currentCharacter}'s dialogue to match their personality`, 
        'smart_dialogue_character'
      );
    }
    
  }, [characters, onTriggerSuggestion]);

  const checkVoiceConsistency = (dialogue: string, personality: string): boolean => {
    // Basic voice consistency check based on personality traits
    const personalityWords = personality.toLowerCase().split(/\s+/);
    const dialogueWords = dialogue.toLowerCase();
    
    // Simple heuristics for voice consistency
    if (personalityWords.includes('formal') && dialogueWords.includes("ain't")) return false;
    if (personalityWords.includes('timid') && dialogueWords.includes('!')) return false;
    if (personalityWords.includes('aggressive') && !dialogueWords.match(/[!.]{2,}/)) return true;
    
    return true; // Default to consistent for basic check
  };

  return {
    dialogueContext,
    analyzeDialogueContext
  };
};
