
export interface WritingBlock {
  type: 'writers_block' | 'transition_gap' | 'character_inconsistency' | 'pacing_issue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestions: string[];
  position?: number;
}

export const detectWritingBlocks = (
  content: string,
  characters: Array<{ name: string }>
): WritingBlock[] => {
  const blocks: WritingBlock[] = [];
  
  // Detect writer's block (short paragraphs, repetitive patterns)
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const shortParagraphs = paragraphs.filter(p => p.length < 50);
  
  if (shortParagraphs.length > paragraphs.length * 0.6) {
    blocks.push({
      type: 'writers_block',
      severity: 'medium',
      message: 'Detected short paragraphs that might indicate writer\'s block',
      suggestions: [
        'Try expanding on character emotions and motivations',
        'Add sensory details to create immersion',
        'Explore the setting and atmosphere',
        'Consider character dialogue to advance the plot'
      ]
    });
  }

  // Detect transition gaps (abrupt scene changes)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const timeWords = ['suddenly', 'meanwhile', 'later', 'next', 'then'];
  const abruptTransitions = sentences.filter((s: string) => 
    timeWords.some(word => s.toLowerCase().includes(word))
  );

  if (abruptTransitions.length > sentences.length * 0.1) {
    blocks.push({
      type: 'transition_gap',
      severity: 'low',
      message: 'Detected potential abrupt scene transitions',
      suggestions: [
        'Add transitional descriptions between scenes',
        'Show character reactions to scene changes',
        'Include time and location anchors',
        'Bridge scenes with character thoughts or actions'
      ]
    });
  }

  // Character consistency check
  const characterNames = characters.map(c => c.name.toLowerCase());
  const mentionedCharacters = characterNames.filter(name => 
    content.toLowerCase().includes(name)
  );

  if (mentionedCharacters.length > 0 && mentionedCharacters.length !== characters.length) {
    blocks.push({
      type: 'character_inconsistency',
      severity: 'medium',
      message: 'Some established characters are missing from this content',
      suggestions: [
        'Consider including reactions from all main characters',
        'Check if missing characters should be present in this scene',
        'Add character interactions to maintain presence',
        'Reference missing characters through dialogue or thoughts'
      ]
    });
  }

  return blocks;
};
