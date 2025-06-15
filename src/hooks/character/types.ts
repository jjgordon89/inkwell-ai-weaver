
export interface CharacterArc {
  id: string;
  characterId: string;
  title: string;
  description: string;
  startChapter?: string;
  endChapter?: string;
  keyMoments: string[];
  completed: boolean;
}

export interface VoiceConsistencyCheck {
  characterId: string;
  consistency: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface InteractionSuggestion {
  id: string;
  character1Id: string;
  character2Id: string;
  type: 'conflict' | 'romance' | 'friendship' | 'rivalry' | 'mentorship';
  description: string;
  context: string;
}

export interface RelationshipNetworkNode {
  id: string;
  name: string;
  group: string;
}

export interface RelationshipNetworkLink {
  source: string;
  target: string;
  type: string;
  description: string;
}

export interface RelationshipNetwork {
  nodes: RelationshipNetworkNode[];
  links: RelationshipNetworkLink[];
}
