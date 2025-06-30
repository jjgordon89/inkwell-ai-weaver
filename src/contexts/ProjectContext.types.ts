import { createContext } from 'react';
import { Project, DocumentNode, DocumentView } from '@/types/document';

export interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  documentTree: DocumentNode[];
  flatDocuments: DocumentNode[];
  activeDocumentId: string | null;
  activeView: DocumentView;
  selectedDocuments: string[];
  searchQuery: string;
  filterStatus: string;
  filterStructure: string;
  isLoading: boolean;
  error: string | null;
}

export type ProjectAction =
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'SET_PROJECTS'; payload: Project[] }
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
  | { type: 'SET_FILTER_STATUS'; payload: string }
  | { type: 'SET_FILTER_STRUCTURE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Create context with enhanced type safety
export interface ProjectContextType {
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string, structure?: 'novel' | 'screenplay' | 'research' | 'poetry') => Promise<Project>;
  updateProject: (id: string, updates: { name?: string; description?: string; status?: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  // Computed property for easily accessing the active project ID
  activeProjectId: string | null;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);
