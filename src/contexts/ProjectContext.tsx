import React, { useReducer, ReactNode, useEffect, useContext } from 'react';
import { Project } from '@/types/document';
import { invoke } from '@/lib/tauri-compat';
import { useToast } from '@/hooks/use-toast';
import { 
  ProjectState, 
  DocumentNode, 
  ProjectAction, 
  ProjectContext,
  ProjectContextType
} from './ProjectContext.types';

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
  filterStatus: 'all',
  filterStructure: 'all',
  isLoading: false,
  error: null
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
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
            ? { ...project, ...action.payload.updates }
            : project
        ),
        currentProject: state.currentProject?.id === action.payload.id
          ? { ...state.currentProject, ...action.payload.updates }
          : state.currentProject
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject
      };
    
    case 'SET_DOCUMENT_TREE': {
      return { 
        ...state, 
        documentTree: action.payload,
        flatDocuments: flattenDocumentTree(action.payload)
      };
    }
    
    case 'ADD_DOCUMENT': {
      const newTree = insertDocumentInTree(state.documentTree, action.payload);
      return {
        ...state,
        documentTree: newTree,
        flatDocuments: flattenDocumentTree(newTree)
      };
    }
    
    case 'UPDATE_DOCUMENT': {
      const updatedTree = updateDocumentInTree(state.documentTree, action.payload.id, action.payload.updates);
      return {
        ...state,
        documentTree: updatedTree,
        flatDocuments: flattenDocumentTree(updatedTree)
      };
    }
    
    case 'DELETE_DOCUMENT': {
      // Prevent deletion of permanent Manuscript folder
      const documentToDelete = state.flatDocuments.find(doc => doc.id === action.payload);
      const isPermanentManuscript = documentToDelete && (
        documentToDelete.id === 'manuscript-root' || 
        (documentToDelete.title === 'Manuscript' && 
         documentToDelete.type === 'folder' && 
         documentToDelete.labels?.includes('permanent'))
      );
      
      if (isPermanentManuscript) {
        console.warn('Cannot delete permanent Manuscript folder');
        return state;
      }
      
      const treeAfterDelete = deleteDocumentFromTree(state.documentTree, action.payload);
      return {
        ...state,
        documentTree: treeAfterDelete,
        flatDocuments: flattenDocumentTree(treeAfterDelete),
        activeDocumentId: state.activeDocumentId === action.payload ? null : state.activeDocumentId
      };
    }
    
    case 'MOVE_DOCUMENT': {
      const { documentId, newParentId, newPosition } = action.payload;
      const movedTree = moveDocumentInTree(state.documentTree, documentId, newParentId, newPosition);
      return {
        ...state,
        documentTree: movedTree,
        flatDocuments: flattenDocumentTree(movedTree)
      };
    }
    
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
    
    case 'SET_FILTER_STRUCTURE':
      return { ...state, filterStructure: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

// Helper functions for document tree operations - these remain unchanged
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
      return { ...node, ...updates };
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
  
  // Update the document's parentId
  const updatedDocument: DocumentNode = {
    ...(documentToMove as DocumentNode),
    parentId: newParentId
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

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { toast } = useToast();

  // Fetch projects from the database when component mounts
  useEffect(() => {
    void fetchProjects();
    // We intentionally only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch all projects
  const fetchProjects = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const projects = await invoke<Project[]>('get_all_projects');
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to load projects: ${error}`,
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to create a new project
  const createProject = async (
    name: string,
    description?: string,
    structure: 'novel' | 'screenplay' | 'research' | 'poetry' = 'novel'
  ): Promise<Project> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const project = await invoke<Project>('create_project', {
        project: { name, description, structure }
      });
      
      dispatch({ type: 'ADD_PROJECT', payload: project });
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to create project: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to update a project
  const updateProject = async (
    id: string, 
    updates: { name?: string; description?: string; status?: string }
  ): Promise<Project> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const project = await invoke<Project>('update_project', {
        project: { id, ...updates }
      });
      
      dispatch({ 
        type: 'UPDATE_PROJECT', 
        payload: { id, updates: project }
      });
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      
      return project;
    } catch (error) {
      console.error('Failed to update project:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to update project: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to delete a project
  const deleteProject = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      await invoke('delete_project', { id });
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      toast({
        title: 'Error',
        description: `Failed to delete project: ${error}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Provide context
  return (
    <ProjectContext.Provider 
      value={{ 
        state, 
        dispatch,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        // Add computed property for easy access to current project ID
        activeProjectId: state.currentProject?.id || null
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Export the useProject hook
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
