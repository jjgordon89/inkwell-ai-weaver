
export interface WritingBlock {
  type: 'pause' | 'repetition' | 'incomplete_sentence';
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  position: number;
}

export interface DialogueContext {
  isInDialogue: boolean;
  currentCharacter?: string;
  availableCharacters: string[];
}

export interface TypingState {
  isTyping: boolean;
  lastTypingTime: number;
}
