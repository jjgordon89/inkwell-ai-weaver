import { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types/document';
import * as sqlWasm from 'sql.js';

/**
 * Migration statuses
 */
export enum MigrationStatus {
  NEEDED = 'needed',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NOT_NEEDED = 'not-needed',
}

/**
 * Migration state in localStorage
 */
const MIGRATION_KEY = 'inkwell_migration_status';

/**
 * Hook to handle the one-time migration from localStorage to SQLite
 */
export function useDataMigration() {
  const [status, setStatus] = useState<MigrationStatus>(MigrationStatus.NOT_NEEDED);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Check if migration is needed
   */
  const checkMigrationNeeded = (): boolean => {
    // Get migration status from localStorage
    const migrationStatus = localStorage.getItem(MIGRATION_KEY);
    
    // If migration is already completed, no need to run again
    if (migrationStatus === MigrationStatus.COMPLETED) {
      return false;
    }
    
    // Check if there's any data in the localStorage db
    const hasLocalStorageData = !!localStorage.getItem('inkwell-db');
    
    return hasLocalStorageData;
  };

  /**
   * Run the migration process
   */
  const runMigration = useCallback(async (): Promise<void> => {
    try {
      setStatus(MigrationStatus.IN_PROGRESS);
      localStorage.setItem(MIGRATION_KEY, MigrationStatus.IN_PROGRESS);
      
      // Show migration toast
      toast({
        title: "Data Migration",
        description: "Migrating your data to the new storage system...",
        duration: 5000,
      });
      
      // Get the data from localStorage
      const dbData = localStorage.getItem('inkwell-db');
      
      if (!dbData) {
        // No data to migrate
        setStatus(MigrationStatus.COMPLETED);
        localStorage.setItem(MIGRATION_KEY, MigrationStatus.COMPLETED);
        return;
      }
      
      // Parse the data - it's stored as a JSON string of a binary array
      const binaryData = new Uint8Array(JSON.parse(dbData));
      
      // Extract projects from the database
      const projects = extractProjects(binaryData);
      
      // Exit early if no projects found
      if (projects.length === 0) {
        console.log('No projects found to migrate');
        setStatus(MigrationStatus.COMPLETED);
        localStorage.setItem(MIGRATION_KEY, MigrationStatus.COMPLETED);
        
        toast({
          title: "Migration Complete",
          description: "No projects found to migrate.",
          variant: "default",
          duration: 5000,
        });
        
        return;
      }
      
      console.log(`Migrating ${projects.length} projects...`);
      
      // Call the Tauri command to migrate data
      await invoke('migrate_from_localstorage', { 
        projectsJson: JSON.stringify(projects) 
      });
      
      // Mark migration as complete
      setStatus(MigrationStatus.COMPLETED);
      localStorage.setItem(MIGRATION_KEY, MigrationStatus.COMPLETED);
      
      // Show success toast
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${projects.length} projects to the new storage system.`,
        variant: "default",
        duration: 5000,
      });
      
      // Clear the old localStorage data to save space
      localStorage.removeItem('inkwell-db');
      
    } catch (err) {
      console.error('Migration failed:', err);
      
      setStatus(MigrationStatus.FAILED);
      setError(err instanceof Error ? err : new Error(String(err)));
      localStorage.setItem(MIGRATION_KEY, MigrationStatus.FAILED);
      
      // Show error toast
      toast({
        title: "Migration Failed",
        description: `Failed to migrate data: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [toast]);
      localStorage.setItem(MIGRATION_KEY, MigrationStatus.FAILED);
      
      // Show error toast
      toast({
        title: "Migration Failed",
        description: `Failed to migrate data: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  /**
   * Extract projects from the SQLite data
   */
  const extractProjects = (sqliteData: Uint8Array): Project[] => {
    try {
      // Initialize SQL.js
      const SQL = sqlWasm.default || sqlWasm;
      const db = new SQL.Database(sqliteData);
      const result = db.exec("SELECT * FROM projects");
      
      const projects: Project[] = [];
      
      if (result.length > 0 && result[0].values) {
        // Map column names to values
        const columns = result[0].columns as string[];
        
        for (const row of result[0].values) {
          const project: Record<string, unknown> = {};
          
          // Create an object with column names as keys
          columns.forEach((col: string, i: number) => {
            project[col] = row[i];
          });
          
          // Convert to Project type with proper type checking
          projects.push({
            id: String(project.id || ''),
            name: String(project.name || ''),
            description: String(project.description || ''),
            createdAt: String(project.created_at || new Date().toISOString()),
            lastModified: String(project.last_modified || new Date().toISOString()),
            structure: (project.structure as 'novel' | 'screenplay' | 'research' | 'poetry') || 'novel',
            status: (project.status as 'active' | 'draft' | 'revision' | 'editing' | 'complete' | 'archived') || 'active',
            wordCountTarget: typeof project.word_count_target === 'number' ? project.word_count_target : undefined,
            lastAccessedAt: project.last_accessed_at ? String(project.last_accessed_at) : undefined,
          });
        }
      }
      
      db.close();
      return projects;
      
    } catch (error) {
      console.error('Error extracting projects:', error);
      throw new Error('Failed to extract project data for migration');
    }
  };

  /**
   * Retry a failed migration
   */
  const retryMigration = async (): Promise<void> => {
    setStatus(MigrationStatus.NEEDED);
    setError(null);
    localStorage.setItem(MIGRATION_KEY, MigrationStatus.NEEDED);
    await runMigration();
  };

  /**
   * Initialize migration
   */
  useEffect(() => {
    const initMigration = async () => {
      if (checkMigrationNeeded()) {
        setStatus(MigrationStatus.NEEDED);
        await runMigration();
      } else {
        setStatus(MigrationStatus.NOT_NEEDED);
      }
    };

    initMigration();
  }, []);

  return {
    status,
    error,
    retryMigration,
    isComplete: status === MigrationStatus.COMPLETED || status === MigrationStatus.NOT_NEEDED,
    isInProgress: status === MigrationStatus.IN_PROGRESS,
    isFailed: status === MigrationStatus.FAILED
  };
}

export default useDataMigration;
