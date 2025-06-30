import { v4 as uuidv4 } from 'uuid';
import { 
  Project, 
  ProjectTemplate, 
  DocumentNode,
  ProjectExport
} from '@/types/document';
import { sanitizeString } from '@/utils/stringUtils';
import { createDefaultDocumentStructure } from '@/utils/documentUtils';
import { serializeDates } from '@/utils/dateUtils';

// Import Tauri API - commented out for development without Tauri
// When using Tauri, uncomment this line
// import { invoke } from '@tauri-apps/api/tauri';

// Mock invoke function for development without Tauri
// Remove this when using the real Tauri invoke
const invoke = async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
  console.log(`Invoking command: ${command}`, args);
  return {} as T;
};

/**
 * Creates a new project with default values
 * @param name Project name
 * @param description Optional project description
 * @param structure Optional project structure type
 * @returns New project object
 */
export const createNewProject = async (
  name: string,
  description?: string,
  structure: 'novel' | 'screenplay' | 'research' | 'poetry' = 'novel'
): Promise<Project> => {
  // Sanitize inputs
  const sanitizedName = sanitizeString(name);
  const sanitizedDescription = description ? sanitizeString(description) : '';
  
  // Create project object
  const now = new Date();
  const project: Project = {
    id: uuidv4(),
    name: sanitizedName,
    description: sanitizedDescription,
    createdAt: now,
    lastModified: now,
    structure,
    status: 'active',
  };
  
  // Save project to backend
  try {
    const serialized = serializeDates(project as unknown as Record<string, unknown>) as unknown as Project;
    const savedProject = await invoke<Project>('create_project', {
      project: serialized
    });
    
    // Create default document structure
    const defaultDocuments = createDefaultDocumentStructure(project.id, structure);
    
    // Save documents to backend
    await invoke('save_document_tree', {
      projectId: project.id,
      documents: serializeDates(defaultDocuments as unknown as Record<string, unknown>[]) as unknown as DocumentNode[]
    });
    
    return savedProject;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
};

/**
 * Creates a new project from a template
 * @param name Project name
 * @param description Optional project description
 * @param template Template to use
 * @returns New project object
 */
export const createProjectFromTemplate = async (
  name: string,
  description: string | undefined,
  template: ProjectTemplate
): Promise<Project> => {
  // Sanitize inputs
  const sanitizedName = sanitizeString(name);
  const sanitizedDescription = description ? sanitizeString(description) : '';
  
  // Create project object
  const now = new Date();
  const project: Project = {
    id: uuidv4(),
    name: sanitizedName,
    description: sanitizedDescription,
    createdAt: now,
    lastModified: now,
    structure: template.structure,
    status: 'active',
  };
  
  // Save project to backend
  try {
    const serialized = serializeDates(project as unknown as Record<string, unknown>) as unknown as Project;
    const savedProject = await invoke<Project>('create_project', {
      project: serialized
    });
    
    // Prepare template documents with new project ID
    const prepareDocuments = (docs = template.initialDocumentTree): DocumentNode[] => {
      return docs.map(doc => ({
        ...doc,
        id: doc.id.includes('template') ? uuidv4() : doc.id,
        parentId: doc.parentId?.includes('template') ? undefined : doc.parentId,
        createdAt: now,
        lastModified: now,
        children: doc.children ? prepareDocuments(doc.children) : undefined
      }));
    };
    
    const templateDocuments = prepareDocuments();
    
    // Save documents to backend
    await invoke('save_document_tree', {
      projectId: project.id,
      documents: serializeDates(templateDocuments as unknown as Record<string, unknown>[]) as unknown as DocumentNode[]
    });
    
    return savedProject;
  } catch (error) {
    console.error('Failed to create project from template:', error);
    throw error;
  }
};

/**
 * Exports a project to a file
 * @param projectId ID of the project to export
 * @returns Project export data
 */
export const exportProject = async (projectId: string): Promise<ProjectExport> => {
  try {
    // Get project data
    const project = await invoke<Project>('get_project', { id: projectId });
    
    // Get project documents
    const documents = await invoke<DocumentNode[]>('get_project_documents', { projectId });
    
    // Get project analytics if available
    let analytics;
    try {
      analytics = await invoke('get_project_analytics', { projectId });
    } catch {
      // Analytics might not be available, continue without them
    }
    
    // Create export data
    const exportData: ProjectExport = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      project,
      documents,
      analytics
    };
    
    return exportData;
  } catch (error) {
    console.error('Failed to export project:', error);
    throw error;
  }
};

/**
 * Imports a project from export data
 * @param exportData Project export data
 * @returns Imported project
 */
export const importProject = async (exportData: ProjectExport): Promise<Project> => {
  try {
    // Validate export data
    if (!exportData.project || !exportData.documents) {
      throw new Error('Invalid export data');
    }
    
    // Create a new project ID to avoid conflicts
    const newProjectId = uuidv4();
    
    // Update project data
    const now = new Date();
    const project = {
      ...exportData.project,
      id: newProjectId,
      createdAt: now,
      lastModified: now,
    };
    
    // Save project to backend
    const savedProject = await invoke<Project>('create_project', {
      project: serializeDates(project as unknown as Record<string, unknown>) as unknown as Project
    });
    
    // Update document IDs and references
    const oldToNewIds = new Map<string, string>();
    
    const updateDocumentIds = (docs: DocumentNode[]): DocumentNode[] => {
      return docs.map(doc => {
        const newId = uuidv4();
        oldToNewIds.set(doc.id, newId);
        
        return {
          ...doc,
          id: newId,
          projectId: newProjectId,
          createdAt: now,
          lastModified: now,
          children: doc.children ? updateDocumentIds(doc.children) : undefined
        };
      });
    };
    
    const documentsWithNewIds = updateDocumentIds(exportData.documents);
    
    // Update parent references
    const updateParentRefs = (docs: DocumentNode[]): DocumentNode[] => {
      return docs.map(doc => {
        return {
          ...doc,
          parentId: doc.parentId ? oldToNewIds.get(doc.parentId) : undefined,
          children: doc.children ? updateParentRefs(doc.children) : undefined
        };
      });
    };
    
    const updatedDocuments = updateParentRefs(documentsWithNewIds);
    
    // Save documents to backend
    await invoke('save_document_tree', {
      projectId: newProjectId,
      documents: serializeDates(updatedDocuments as unknown as Record<string, unknown>[]) as unknown as DocumentNode[]
    });
    
    // Import analytics if available
    if (exportData.analytics) {
      try {
        await invoke('save_project_analytics', {
          projectId: newProjectId,
          analytics: {
            ...exportData.analytics,
            projectId: newProjectId
          }
        });
      } catch {
        // Continue even if analytics import fails
      }
    }
    
    return savedProject;
  } catch (error) {
    console.error('Failed to import project:', error);
    throw error;
  }
};
