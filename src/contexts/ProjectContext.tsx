
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { DocumentNode, Project, DocumentView } from '@/types/document';

interface ProjectState {
  currentProject: Project | null;
  documentTree: DocumentNode[];
  flatDocuments: DocumentNode[];
  activeDocumentId: string | null;
  activeView: DocumentView;
  isLoading: boolean;
  error: string | null;
}

type ProjectAction = 
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'ADD_DOCUMENT'; payload: DocumentNode }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<DocumentNode> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'MOVE_DOCUMENT'; payload: { documentId: string; newParentId?: string; newPosition: number } }
  | { type: 'SET_ACTIVE_DOCUMENT'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: DocumentView }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ProjectState = {
  currentProject: null,
  documentTree: [],
  flatDocuments: [],
  activeDocumentId: null,
  activeView: { id: 'editor', name: 'Editor', type: 'editor' },
  isLoading: false,
  error: null
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
        documentTree: buildDocumentTree(action.payload.documents || []),
        flatDocuments: action.payload.documents || []
      };

    case 'ADD_DOCUMENT':
      const newFlatDocs = [...state.flatDocuments, action.payload];
      return {
        ...state,
        flatDocuments: newFlatDocs,
        documentTree: buildDocumentTree(newFlatDocs)
      };

    case 'UPDATE_DOCUMENT':
      const updatedFlatDocs = state.flatDocuments.map(doc =>
        doc.id === action.payload.id
          ? { ...doc, ...action.payload.updates, lastModified: new Date() }
          : doc
      );
      return {
        ...state,
        flatDocuments: updatedFlatDocs,
        documentTree: buildDocumentTree(updatedFlatDocs)
      };

    case 'DELETE_DOCUMENT':
      const filteredDocs = state.flatDocuments.filter(doc => doc.id !== action.payload);
      return {
        ...state,
        flatDocuments: filteredDocs,
        documentTree: buildDocumentTree(filteredDocs),
        activeDocumentId: state.activeDocumentId === action.payload ? null : state.activeDocumentId
      };

    case 'MOVE_DOCUMENT':
      const { documentId, newParentId, newPosition } = action.payload;
      const movedDocs = state.flatDocuments.map(doc =>
        doc.id === documentId
          ? { ...doc, parentId: newParentId, position: newPosition }
          : doc
      );
      return {
        ...state,
        flatDocuments: movedDocs,
        documentTree: buildDocumentTree(movedDocs)
      };

    case 'SET_ACTIVE_DOCUMENT':
      return { ...state, activeDocumentId: action.payload };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

function buildDocumentTree(documents: DocumentNode[]): DocumentNode[] {
  const documentMap = new Map<string, DocumentNode>();
  const rootNodes: DocumentNode[] = [];

  // Create map and initialize children arrays
  documents.forEach(doc => {
    documentMap.set(doc.id, { ...doc, children: [] });
  });

  // Build tree structure
  documents.forEach(doc => {
    const node = documentMap.get(doc.id)!;
    if (doc.parentId && documentMap.has(doc.parentId)) {
      const parent = documentMap.get(doc.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // Sort by position
  const sortByPosition = (nodes: DocumentNode[]) => {
    nodes.sort((a, b) => (a.position || 0) - (b.position || 0));
    nodes.forEach(node => {
      if (node.children) {
        sortByPosition(node.children);
      }
    });
  };

  sortByPosition(rootNodes);
  return rootNodes;
}

interface ProjectContextValue {
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

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
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
