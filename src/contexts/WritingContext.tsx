
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Character {
  id: string;
  name: string;
  description: string;
  tags: string[];
  notes?: string;
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
  type: 'location' | 'culture' | 'technology' | 'magic' | 'other';
  description: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

export interface WritingState {
  currentDocument: Document | null;
  documents: Document[];
  selectedText: string;
  isProcessing: boolean;
  autoSaveEnabled: boolean;
  activeSection: string;
  characters: Character[];
  storyArcs: StoryArc[];
  worldElements: WorldElement[];
}

export type WritingAction =
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document | null }
  | { type: 'UPDATE_DOCUMENT_CONTENT'; payload: { id: string; content: string } }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_AUTO_SAVE'; payload: boolean }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'ADD_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'ADD_STORY_ARC'; payload: StoryArc }
  | { type: 'UPDATE_STORY_ARC'; payload: StoryArc }
  | { type: 'DELETE_STORY_ARC'; payload: string }
  | { type: 'ADD_WORLD_ELEMENT'; payload: WorldElement }
  | { type: 'UPDATE_WORLD_ELEMENT'; payload: WorldElement }
  | { type: 'DELETE_WORLD_ELEMENT'; payload: string };

const initialState: WritingState = {
  currentDocument: null,
  documents: [],
  selectedText: '',
  isProcessing: false,
  autoSaveEnabled: true,
  activeSection: 'story',
  characters: [],
  storyArcs: [],
  worldElements: []
};

const writingReducer = (state: WritingState, action: WritingAction): WritingState => {
  switch (action.type) {
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    case 'UPDATE_DOCUMENT_CONTENT':
      const updatedDocuments = state.documents.map(doc =>
        doc.id === action.payload.id
          ? { 
              ...doc, 
              content: action.payload.content,
              wordCount: action.payload.content.trim().split(/\s+/).filter(Boolean).length,
              updatedAt: new Date()
            }
          : doc
      );
      const updatedCurrentDoc = state.currentDocument?.id === action.payload.id
        ? { 
            ...state.currentDocument, 
            content: action.payload.content,
            wordCount: action.payload.content.trim().split(/\s+/).filter(Boolean).length,
            updatedAt: new Date()
          }
        : state.currentDocument;
      return {
        ...state,
        documents: updatedDocuments,
        currentDocument: updatedCurrentDoc
      };
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_AUTO_SAVE':
      return { ...state, autoSaveEnabled: action.payload };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
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
    case 'DELETE_STORY_ARC':
      return {
        ...state,
        storyArcs: state.storyArcs.filter(arc => arc.id !== action.payload)
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
    default:
      return state;
  }
};

interface WritingContextType {
  state: WritingState;
  dispatch: React.Dispatch<WritingAction>;
}

const WritingContext = createContext<WritingContextType | undefined>(undefined);

export const WritingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(writingReducer, initialState);

  return (
    <WritingContext.Provider value={{ state, dispatch }}>
      {children}
    </WritingContext.Provider>
  );
};

export const useWriting = () => {
  const context = useContext(WritingContext);
  if (context === undefined) {
    throw new Error('useWriting must be used within a WritingProvider');
  }
  return context;
};
