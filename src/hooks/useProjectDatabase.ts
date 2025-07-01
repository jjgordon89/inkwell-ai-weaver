import { useEffect, useState, useCallback } from 'react';
import { useSqliteWorker } from './useSqliteWorker';
import { v4 as uuidv4 } from 'uuid';

interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  status: 'active' | 'draft' | 'revision' | 'editing' | 'complete' | 'archived';
  template?: string;
  wordCount: number;
  wordCountTarget?: number;
  createdAt: string;
  lastModified: string;
  lastAccessedAt?: string;
  settings?: string; // JSON stringified settings
}

interface ProjectFilter {
  searchTerm?: string;
  status?: 'active' | 'draft' | 'revision' | 'editing' | 'complete' | 'archived';
  structure?: 'novel' | 'screenplay' | 'research' | 'poetry';
  template?: string | null;
  sortBy?: 'name' | 'createdAt' | 'lastModified' | 'lastAccessedAt' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  archivedProjects: number;
  draftProjects: number;
  totalWords: number;
}

/**
 * Hook for managing projects in SQLite
 */
export function useProjectDatabase() {
  const { 
    isInitialized, 
    error: sqlError, 
    createDatabase, 
    exec, 
    run, 
    all, 
    get,
    tableExists
  } = useSqliteWorker();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Initialize the database
  useEffect(() => {
    if (!isInitialized) return;
    
    const initializeDatabase = async () => {
      setIsLoading(true);
      try {
        // Create a new database
        await createDatabase();
        
        // Check if projects table exists
        const projectsTableExists = await tableExists('projects');
        
        if (!projectsTableExists) {
          // Create projects table
          await exec(`
            CREATE TABLE IF NOT EXISTS projects (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              structure TEXT NOT NULL,
              status TEXT NOT NULL,
              template TEXT,
              wordCount INTEGER NOT NULL DEFAULT 0,
              wordCountTarget INTEGER,
              createdAt TEXT NOT NULL,
              lastModified TEXT NOT NULL,
              lastAccessedAt TEXT,
              settings TEXT
            )
          `);
          
          // Create indexes
          await exec(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`);
          await exec(`CREATE INDEX IF NOT EXISTS idx_projects_structure ON projects(structure)`);
          await exec(`CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(template)`);
        }
        
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize project database:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDatabase();
  }, [isInitialized, createDatabase, exec, tableExists]);
  
  // Create a new project
  const createProject = useCallback(async (project: Omit<ProjectRecord, 'id' | 'createdAt' | 'lastModified'>) => {
    if (!isReady) throw new Error('Database not ready');
    
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const newProject: ProjectRecord = {
      id,
      ...project,
      wordCount: project.wordCount || 0,
      createdAt: now,
      lastModified: now
    };
    
    // Convert settings object to JSON string if it exists
    const settings = typeof newProject.settings === 'object' 
      ? JSON.stringify(newProject.settings) 
      : newProject.settings;
    
    await run(
      `INSERT INTO projects (
        id, name, description, structure, status, template,
        wordCount, wordCountTarget, createdAt, lastModified, lastAccessedAt, settings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newProject.id,
        newProject.name,
        newProject.description,
        newProject.structure,
        newProject.status,
        newProject.template,
        newProject.wordCount,
        newProject.wordCountTarget,
        newProject.createdAt,
        newProject.lastModified,
        newProject.lastAccessedAt,
        settings
      ]
    );
    
    return newProject;
  }, [isReady, run]);
  
  // Get all projects with optional filters
  const getProjects = useCallback(async (filter?: ProjectFilter) => {
    if (!isReady) throw new Error('Database not ready');
    
    let query = `SELECT * FROM projects`;
    const params: any[] = [];
    const conditions: string[] = [];
    
    // Apply filters
    if (filter) {
      // Search term
      if (filter.searchTerm) {
        conditions.push(`(name LIKE ? OR description LIKE ?)`);
        params.push(`%${filter.searchTerm}%`, `%${filter.searchTerm}%`);
      }
      
      // Status filter
      if (filter.status) {
        conditions.push(`status = ?`);
        params.push(filter.status);
      }
      
      // Structure filter
      if (filter.structure) {
        conditions.push(`structure = ?`);
        params.push(filter.structure);
      }
      
      // Template filter
      if (filter.template !== undefined) {
        if (filter.template === null) {
          conditions.push(`template IS NULL`);
        } else {
          conditions.push(`template = ?`);
          params.push(filter.template);
        }
      }
      
      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      // Add ORDER BY clause
      if (filter.sortBy) {
        query += ` ORDER BY ${filter.sortBy} ${filter.sortOrder || 'DESC'}`;
      } else {
        query += ` ORDER BY lastModified DESC`;
      }
      
      // Add LIMIT and OFFSET for pagination
      if (filter.limit) {
        query += ` LIMIT ?`;
        params.push(filter.limit);
        
        if (filter.offset) {
          query += ` OFFSET ?`;
          params.push(filter.offset);
        }
      }
    } else {
      // Default sorting
      query += ` ORDER BY lastModified DESC`;
    }
    
    const projects: ProjectRecord[] = await all(query, params);
    
    // Parse settings JSON
    return projects.map(project => ({
      ...project,
      settings: project.settings ? JSON.parse(project.settings) : undefined
    }));
  }, [isReady, all]);
  
  // Get a single project by ID
  const getProject = useCallback(async (id: string) => {
    if (!isReady) throw new Error('Database not ready');
    
    const project: ProjectRecord | null = await get(
      `SELECT * FROM projects WHERE id = ?`,
      [id]
    );
    
    if (!project) return null;
    
    // Parse settings JSON
    return {
      ...project,
      settings: project.settings ? JSON.parse(project.settings) : undefined
    };
  }, [isReady, get]);
  
  // Update a project
  const updateProject = useCallback(async (id: string, updates: Partial<Omit<ProjectRecord, 'id' | 'createdAt'>>) => {
    if (!isReady) throw new Error('Database not ready');
    
    // Check if project exists
    const project = await getProject(id);
    if (!project) throw new Error(`Project with ID ${id} not found`);
    
    // Prepare update fields
    const updateFields: string[] = [];
    const params: any[] = [];
    
    // Add lastModified timestamp
    updates.lastModified = new Date().toISOString();
    
    // Build update query
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'settings' && typeof value === 'object') {
        // Convert settings object to JSON string
        updateFields.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    });
    
    // Add ID to params
    params.push(id);
    
    await run(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    // Get updated project
    return getProject(id);
  }, [isReady, getProject, run]);
  
  // Delete a project
  const deleteProject = useCallback(async (id: string) => {
    if (!isReady) throw new Error('Database not ready');
    
    await run(
      `DELETE FROM projects WHERE id = ?`,
      [id]
    );
    
    return { deleted: true, id };
  }, [isReady, run]);
  
  // Get project statistics
  const getProjectStats = useCallback(async (): Promise<ProjectStats> => {
    if (!isReady) throw new Error('Database not ready');
    
    // Get total projects count
    const totalResult = await get<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects`
    );
    
    // Get active projects count
    const activeResult = await get<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects WHERE status != 'archived'`
    );
    
    // Get archived projects count
    const archivedResult = await get<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects WHERE status = 'archived'`
    );
    
    // Get draft projects count
    const draftResult = await get<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects WHERE status = 'draft'`
    );
    
    // Get total word count
    const wordsResult = await get<{ total: number }>(
      `SELECT SUM(wordCount) as total FROM projects`
    );
    
    return {
      totalProjects: totalResult?.count || 0,
      activeProjects: activeResult?.count || 0,
      archivedProjects: archivedResult?.count || 0,
      draftProjects: draftResult?.count || 0,
      totalWords: wordsResult?.total || 0,
    };
  }, [isReady, get]);
  
  return {
    isLoading,
    isReady,
    error: error || sqlError,
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    getProjectStats,
  };
}

// Export types for use in other files
export type { ProjectRecord, ProjectFilter, ProjectStats };
