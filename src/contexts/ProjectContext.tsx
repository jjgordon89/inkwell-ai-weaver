
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
    
    case 'DELETE_DOCUMENT':
      const treeAfterDelete = deleteDocumentFromTree(state.documentTree, action.payload);
      return {
        ...state,
        documentTree: treeAfterDelete,
        flatDocuments: flattenDocumentTree(treeAfterDelete),
        activeDocumentId: state.activeDocumentId === action.payload ? null : state.activeDocumentId
      };
    
    case 'MOVE_DOCUMENT':
      const { documentId, newParentId, newPosition } = action.payload;
      const movedTree = moveDocumentInTree(state.documentTree, documentId, newParentId, newPosition);
      return {
        ...state,
        documentTree: movedTree,
        flatDocuments: flattenDocumentTree(movedTree)
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

function deleteDocumentFromTree(tree: DocumentNode[], docId: string): DocumentNode[] {
  return tree.filter(node => node.id !== docId).map(node => {
    if (node.children) {
      return {
        ...node,
        children: deleteDocumentFromTree(node.children, docId)
      };
    }
    return node;
  });
}

function moveDocumentInTree(
  tree: DocumentNode[], 
  documentId: string, 
  newParentId?: string, 
  newPosition: number = 0
): DocumentNode[] {
  // First, find and remove the document from its current location
  let documentToMove: DocumentNode | null = null;
  
  const removeDocument = (nodes: DocumentNode[]): DocumentNode[] => {
    return nodes.filter(node => {
      if (node.id === documentId) {
        documentToMove = node;
        return false;
      }
      if (node.children) {
        node.children = removeDocument(node.children);
      }
      return true;
    });
  };
  
  const treeWithoutMoved = removeDocument([...tree]);
  
  if (!documentToMove) return tree;
  
  // Update the document's parentId - fix the TypeScript error here
  const updatedDocument: DocumentNode = {
    ...documentToMove,
    parentId: newParentId,
    lastModified: new Date()
  };
  
  // Insert the document in its new location
  if (!newParentId) {
    // Moving to root level
    const rootDocs = [...treeWithoutMoved];
    rootDocs.splice(newPosition, 0, updatedDocument);
    return rootDocs;
  } else {
    // Moving to a parent folder
    const insertIntoParent = (nodes: DocumentNode[]): DocumentNode[] => {
      return nodes.map(node => {
        if (node.id === newParentId) {
          const children = [...(node.children || [])];
          children.splice(newPosition, 0, updatedDocument);
          return { ...node, children };
        }
        if (node.children) {
          return { ...node, children: insertIntoParent(node.children) };
        }
        return node;
      });
    };
    
    return insertIntoParent(treeWithoutMoved);
  }
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
