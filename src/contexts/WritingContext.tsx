
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Character {
  id: string;
  name: string;
  description: string;
  notes: string;
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
  | { type: 'ADD_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'ADD_STORY_ARC'; payload: StoryArc }
  | { type: 'UPDATE_STORY_ARC'; payload: StoryArc }
  | { type: 'ADD_WORLD_ELEMENT'; payload: WorldElement }
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
} | null>(null);

export const WritingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(writingReducer, initialState);

  return (
    <WritingContext.Provider value={{ state, dispatch }}>
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
