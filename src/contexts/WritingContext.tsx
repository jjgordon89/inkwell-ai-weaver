import React, { useReducer, ReactNode, useEffect, useContext } from 'react';
import { invoke } from '@/lib/tauri-compat';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  WritingState, 
  WritingAction, 
  WritingContext,
  Document,
  Character
} from './WritingContext.types';

const initialState: WritingState = {
  currentDocument: null,
  documents: [],
  characters: [],
  storyArcs: [],
  worldElements: [],
  selectedText: '',
  activeSection: 'story',
  isLoading: false,
  error: null
};

function writingReducer(state: WritingState, action: WritingAction): WritingState {
  switch (action.type) {
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    
    case 'UPDATE_DOCUMENT_CONTENT': {
      const updatedDocument = state.currentDocument && state.currentDocument.id === action.payload.id
        ? {
            ...state.currentDocument,
            content: action.payload.content,
            lastModified: new Date(),
            wordCount: action.payload.content.trim().split(/\s+/).filter(Boolean).length
          }
        : state.currentDocument;
      return { ...state, currentDocument: updatedDocument };
    }
    
    case 'UPDATE_DOCUMENT': {
      const updatedDoc = state.currentDocument && state.currentDocument.id === action.payload.id
        ? {
            ...state.currentDocument,
            ...action.payload.updates,
            lastModified: new Date()
          }
        : state.currentDocument;
      
      const updatedDocuments = state.documents.map(doc => 
        doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
      );
      
      return { 
        ...state, 
        currentDocument: updatedDoc,
        documents: updatedDocuments
      };
    }
    
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
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

export const WritingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(writingReducer, initialState);
  const { toast } = useToast();

  // Update document - integrates with Tauri backend
  const updateDocument = async (id: string, updates: Partial<Document>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Call Tauri backend API to update document
      await invoke('update_document', { id, updates });
      
      // Update state
      dispatch({ 
        type: 'UPDATE_DOCUMENT', 
        payload: { id, updates } 
      });
      
      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
    } catch (error) {
      console.error('Failed to update document:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to update document: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Save document content - integrates with Tauri backend
  const saveDocumentContent = async (id: string, content: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Call Tauri backend API to save document content
      await invoke('update_document_content', { id, content });
      
      // Update state
      dispatch({ 
        type: 'UPDATE_DOCUMENT_CONTENT', 
        payload: { id, content } 
      });
      
      toast({
        title: 'Success',
        description: 'Document saved',
      });
    } catch (error) {
      console.error('Failed to save document content:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to save document: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add character - integrates with Tauri backend
  const addCharacter = async (characterData: Omit<Character, 'id'>): Promise<Character> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Prepare data with generated ID
      const newCharacter: Character = {
        ...characterData,
        id: uuidv4()
      };
      
      // Call Tauri backend API to add character
      const savedCharacter = await invoke<Character>('add_character', { character: newCharacter });
      
      // Update state
      dispatch({ type: 'ADD_CHARACTER', payload: savedCharacter });
      
      toast({
        title: 'Success',
        description: 'Character created successfully',
      });
      
      return savedCharacter;
    } catch (error) {
      console.error('Failed to add character:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to create character: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update character - integrates with Tauri backend
  const updateCharacter = async (id: string, updates: Partial<Character>): Promise<Character> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Call Tauri backend API to update character
      const updatedCharacter = await invoke<Character>('update_character', { 
        id, 
        updates 
      });
      
      // Update state
      dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
      
      toast({
        title: 'Success',
        description: 'Character updated successfully',
      });
      
      return updatedCharacter;
    } catch (error) {
      console.error('Failed to update character:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to update character: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Delete character - integrates with Tauri backend
  const deleteCharacter = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Call Tauri backend API to delete character
      await invoke('delete_character', { id });
      
      // Update state
      dispatch({ type: 'DELETE_CHARACTER', payload: id });
      
      toast({
        title: 'Success',
        description: 'Character deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete character:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to delete character: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <WritingContext.Provider value={{ 
      state, 
      dispatch,
      updateDocument,
      saveDocumentContent,
      addCharacter,
      updateCharacter,
      deleteCharacter
    }}>
      {children}
    </WritingContext.Provider>
  );
};

// Export the useWriting hook
export const useWriting = () => {
  const context = useContext(WritingContext);
  if (!context) {
    throw new Error('useWriting must be used within a WritingProvider');
  }
  return context;
};
