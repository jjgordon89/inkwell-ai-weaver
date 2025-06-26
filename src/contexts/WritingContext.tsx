
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
}

export type WritingAction =
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document | null }
  | { type: 'UPDATE_DOCUMENT_CONTENT'; payload: { id: string; content: string } }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_AUTO_SAVE'; payload: boolean }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'SET_DOCUMENTS'; payload: Document[] };

const initialState: WritingState = {
  currentDocument: null,
  documents: [],
  selectedText: '',
  isProcessing: false,
  autoSaveEnabled: true
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
