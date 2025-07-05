import type { Project } from './document';

/**
 * Input type for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  description: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
  wordCountTarget?: number;
  template?: string; // Template ID if created from a template
  settings?: {
    autoSaveInterval?: number;
    defaultContentFormat?: string;
    defaultDocumentType?: string;
    enableAiAssistance?: boolean;
    aiProviders?: string[];
    customFields?: Record<string, unknown>;
  };
}

/**
 * Input type for updating an existing project
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  structure?: 'novel' | 'screenplay' | 'research' | 'poetry';
  wordCountTarget?: number;
  status?: 'active' | 'draft' | 'revision' | 'editing' | 'complete' | 'archived';
  template?: string;
  settings?: {
    autoSaveInterval?: number;
    defaultContentFormat?: string;
    defaultDocumentType?: string;
    enableAiAssistance?: boolean;
    aiProviders?: string[];
    customFields?: Record<string, unknown>;
  };
}

/**
 * Type for project filters
 */
export interface ProjectFilters {
  status?: 'active' | 'draft' | 'revision' | 'editing' | 'complete' | 'archived';
  structure?: 'novel' | 'screenplay' | 'research' | 'poetry';
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt' | 'lastModified' | 'lastAccessedAt' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Input type for project batch operations
 */
export interface ProjectBatchOperation {
  ids: string[];
  operation: 'archive' | 'unarchive' | 'delete' | 'changeStatus';
  value?: string; // For changeStatus operation
}
