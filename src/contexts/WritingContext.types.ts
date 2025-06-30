import { createContext } from 'react';

export interface Character {
  id: string;
  name: string;
  description: string;
  notes: string;
  age?: number;
  occupation?: string;
  appearance?: string;
  personality?: string;
  backstory?: string;
  tags: string[];
  relationships: CharacterRelationship[];
  createdWith?: 'manual' | 'ai';
  voiceNotes?: string;
  arcProgress?: number; // 0-100 for character development tracking
}

export interface CharacterRelationship {
  id: string;
  characterId: string;
  relatedCharacterId: string;
  relationshipType: string;
  description?: string;
}

export interface StoryArc {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface WorldElement {
  id: string;
  name: string;
  type: 'location' | 'organization' | 'concept';
  description: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  wordCount: number;
}

export interface WritingState {
  currentDocument: Document | null;
  documents: Document[];
  characters: Character[];
  storyArcs: StoryArc[];
  worldElements: WorldElement[];
  selectedText: string;
  activeSection: 'story' | 'outline' | 'story-structure' | 'characters' | 'story-arc' | 'world-building' | 'cross-references' | 'ai-assistance' | 'export-publishing';
  isLoading: boolean;
  error: string | null;
}

export type WritingAction =
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT_CONTENT'; payload: { id: string; content: string } }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'ADD_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'ADD_STORY_ARC'; payload: StoryArc }
  | { type: 'UPDATE_STORY_ARC'; payload: StoryArc }
  | { type: 'ADD_WORLD_ELEMENT'; payload: WorldElement }
  | { type: 'UPDATE_WORLD_ELEMENT'; payload: WorldElement }
  | { type: 'DELETE_WORLD_ELEMENT'; payload: string }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_ACTIVE_SECTION'; payload: WritingState['activeSection'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Create context with enhanced type safety
export interface WritingContextType {
  state: WritingState;
  dispatch: React.Dispatch<WritingAction>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  saveDocumentContent: (id: string, content: string) => Promise<void>;
  addCharacter: (character: Omit<Character, 'id'>) => Promise<Character>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
}

export const WritingContext = createContext<WritingContextType | null>(null);
