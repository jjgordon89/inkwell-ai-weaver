
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Project, DocumentNode, DocumentView } from '@/types/document';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  documentTree: DocumentNode[];
  flatDocuments: DocumentNode[];
  activeDocumentId: string | null;
  activeView: DocumentView;
  selectedDocuments: string[];
  searchQuery: string;
  filterStatus: string;
}

type ProjectAction =
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_DOCUMENT_TREE'; payload: DocumentNode[] }
  | { type: 'ADD_DOCUMENT'; payload: DocumentNode }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<DocumentNode> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'MOVE_DOCUMENT'; payload: { documentId: string; newParentId?: string; newPosition: number } }
  | { type: 'SET_ACTIVE_DOCUMENT'; payload: string | null }
  | { type: 'SET_ACTIVE_VIEW'; payload: DocumentView }
  | { type: 'SET_SELECTED_DOCUMENTS'; payload: string[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_STATUS'; payload: string };

const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  documentTree: [],
  flatDocuments: [],
  activeDocumentId: null,
  activeView: {
    id: 'default',
    name: 'Editor',
    type: 'editor'
  },
  selectedDocuments: [],
  searchQuery: '',
  filterStatus: 'all'
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [...state.projects, action.payload] 
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id 
            ? { ...project, ...action.payload.updates, lastModified: new Date() }
            : project
        ),
        currentProject: state.currentProject?.id === action.payload.id
          ? { ...state.currentProject, ...action.payload.updates, lastModified: new Date() }
          : state.currentProject
      };
    
    case 'SET_DOCUMENT_TREE':
      return { 
        ...state, 
        documentTree: action.payload,
        flatDocuments: flattenDocumentTree(action.payload)
      };
    
    case 'ADD_DOCUMENT':
      const newTree = insertDocumentInTree(state.documentTree, action.payload);
      return {
        ...state,
        documentTree: newTree,
        flatDocuments: flattenDocumentTree(newTree)
      };
    
    case 'UPDATE_DOCUMENT':
      const updatedTree = updateDocumentInTree(state.documentTree, action.payload.id, action.payload.updates);
      return {
        ...state,
        documentTree: updatedTree,
        flatDocuments: flattenDocumentTree(updatedTree)
      };
    
    case 'SET_ACTIVE_DOCUMENT':
      return { ...state, activeDocumentId: action.payload };
    
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    
    case 'SET_SELECTED_DOCUMENTS':
      return { ...state, selectedDocuments: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload };
    
    default:
      return state;
  }
}

// Helper functions
function flattenDocumentTree(tree: DocumentNode[]): DocumentNode[] {
  const result: DocumentNode[] = [];
  
  function traverse(nodes: DocumentNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        traverse(node.children);
      }
    }
  }
  
  traverse(tree);
  return result;
}

function insertDocumentInTree(tree: DocumentNode[], newDoc: DocumentNode): DocumentNode[] {
  if (!newDoc.parentId) {
    return [...tree, newDoc];
  }
  
  return tree.map(node => {
    if (node.id === newDoc.parentId) {
      return {
        ...node,
        children: [...(node.children || []), newDoc]
      };
    }
    if (node.children) {
      return {
        ...node,
        children: insertDocumentInTree(node.children, newDoc)
      };
    }
    return node;
  });
}

function updateDocumentInTree(tree: DocumentNode[], docId: string, updates: Partial<DocumentNode>): DocumentNode[] {
  return tree.map(node => {
    if (node.id === docId) {
      return { ...node, ...updates, lastModified: new Date() };
    }
    if (node.children) {
      return {
        ...node,
        children: updateDocumentInTree(node.children, docId, updates)
      };
    }
    return node;
  });
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | null>(null);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
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
