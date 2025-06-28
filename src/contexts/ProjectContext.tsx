
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { DocumentNode } from '@/types/document';

export interface Project {
  id: string;
  title: string;
  description: string;
  genre?: string;
  createdAt: Date;
  lastModified: Date;
  wordCount: number;
  settings: Record<string, unknown>;
}

export interface DocumentView {
  id: string;
  name: string;
  type: 'editor' | 'corkboard' | 'outline' | 'timeline' | 'research';
  activeDocumentId?: string;
  viewSettings?: Record<string, unknown>;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  documentTree: DocumentNode[];
  flatDocuments: DocumentNode[];
  activeDocumentId: string | null;
  activeView: DocumentView;
}

export type ProjectAction =
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'SET_ACTIVE_DOCUMENT'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: DocumentView }
  | { type: 'ADD_DOCUMENT'; payload: DocumentNode }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<DocumentNode> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'MOVE_DOCUMENT'; payload: { documentId: string; newParentId?: string; newPosition: number } };

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  documentTree: [],
  flatDocuments: [],
  activeDocumentId: null,
  activeView: { id: 'editor', name: 'Editor', type: 'editor' }
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload
      };
    case 'SET_ACTIVE_DOCUMENT':
      return {
        ...state,
        activeDocumentId: action.payload
      };
    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        activeView: action.payload
      };
    case 'ADD_DOCUMENT':
      return {
        ...state,
        flatDocuments: [...state.flatDocuments, action.payload],
        documentTree: buildDocumentTree([...state.flatDocuments, action.payload])
      };
    case 'UPDATE_DOCUMENT':
      const updatedDocs = state.flatDocuments.map(doc =>
        doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
      );
      return {
        ...state,
        flatDocuments: updatedDocs,
        documentTree: buildDocumentTree(updatedDocs)
      };
    case 'DELETE_DOCUMENT':
      const filteredDocs = state.flatDocuments.filter(doc => doc.id !== action.payload);
      return {
        ...state,
        flatDocuments: filteredDocs,
        documentTree: buildDocumentTree(filteredDocs)
      };
    case 'MOVE_DOCUMENT':
      // Simple implementation - in a real app this would be more complex
      return state;
    default:
      return state;
  }
}

function buildDocumentTree(documents: DocumentNode[]): DocumentNode[] {
  const documentMap = new Map<string, DocumentNode>();
  const rootDocuments: DocumentNode[] = [];

  // Create a map of all documents
  documents.forEach(doc => {
    documentMap.set(doc.id, { ...doc, children: [] });
  });

  // Build the tree structure
  documents.forEach(doc => {
    const docWithChildren = documentMap.get(doc.id)!;
    if (doc.parentId) {
      const parent = documentMap.get(doc.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(docWithChildren);
      }
    } else {
      rootDocuments.push(docWithChildren);
    }
  });

  return rootDocuments;
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
