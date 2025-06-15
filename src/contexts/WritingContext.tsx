import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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

interface WritingState {
  currentDocument: Document | null;
  documents: Document[];
  characters: Character[];
  storyArcs: StoryArc[];
  worldElements: WorldElement[];
  selectedText: string;
  activeSection: 'story' | 'characters' | 'story-arc' | 'world-building' | 'cross-references' | 'ai-assistance';
}

type WritingAction =
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
  | { type: 'SET_ACTIVE_SECTION'; payload: WritingState['activeSection'] };

const initialState: WritingState = {
  currentDocument: {
    id: '1',
    title: 'Chapter 1: An Unexpected Party',
    content: `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.`,
    lastModified: new Date(),
    wordCount: 0
  },
  documents: [],
  characters: [],
  storyArcs: [],
  worldElements: [],
  selectedText: '',
  activeSection: 'story'
};

function writingReducer(state: WritingState, action: WritingAction): WritingState {
  switch (action.type) {
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    case 'UPDATE_DOCUMENT_CONTENT':
      const updatedDocument = state.currentDocument && state.currentDocument.id === action.payload.id
        ? {
            ...state.currentDocument,
            content: action.payload.content,
            lastModified: new Date(),
            wordCount: action.payload.content.trim().split(/\s+/).filter(Boolean).length
          }
        : state.currentDocument;
      return { ...state, currentDocument: updatedDocument };
    case 'UPDATE_DOCUMENT':
      const updatedDoc = state.currentDocument && state.currentDocument.id === action.payload.id
        ? {
            ...state.currentDocument,
            ...action.payload.updates,
            lastModified: new Date()
          }
        : state.currentDocument;
      return { ...state, currentDocument: updatedDoc };
    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id ? action.payload : char
        )
      };
    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(char => char.id !== action.payload)
      };
    case 'ADD_STORY_ARC':
      return { ...state, storyArcs: [...state.storyArcs, action.payload] };
    case 'UPDATE_STORY_ARC':
      return {
        ...state,
        storyArcs: state.storyArcs.map(arc =>
          arc.id === action.payload.id ? action.payload : arc
        )
      };
    case 'ADD_WORLD_ELEMENT':
      return { ...state, worldElements: [...state.worldElements, action.payload] };
    case 'UPDATE_WORLD_ELEMENT':
      return {
        ...state,
        worldElements: state.worldElements.map(element =>
          element.id === action.payload.id ? action.payload : element
        )
      };
    case 'DELETE_WORLD_ELEMENT':
      return {
        ...state,
        worldElements: state.worldElements.filter(element => element.id !== action.payload)
      };
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.payload };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    default:
      return state;
  }
}

const WritingContext = createContext<{
  state: WritingState;
  dispatch: React.Dispatch<WritingAction>;
  updateDocument: (id: string, updates: Partial<Document>) => void;
} | null>(null);

export const WritingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(writingReducer, initialState);

  const updateDocument = (id: string, updates: Partial<Document>) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });
  };

  return (
    <WritingContext.Provider value={{ state, dispatch, updateDocument }}>
      {children}
    </WritingContext.Provider>
  );
};

export const useWriting = () => {
  const context = useContext(WritingContext);
  if (!context) {
    throw new Error('useWriting must be used within a WritingProvider');
  }
  return context;
};
