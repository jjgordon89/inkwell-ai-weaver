import { useCallback, useState } from 'react';
import { invoke } from '@/lib/tauri-compat';
import { ProjectTemplate } from '@/types/document';
import { sanitizeString } from '@/utils/stringUtils';
import { categorizeError, ErrorInfo } from '@/utils/errorUtils';
import { useAppToast } from './useAppToast';

export interface UseProjectTemplatesOptions {
  showSuccessToasts?: boolean;
  showErrorToasts?: boolean;
}

const defaultOptions: UseProjectTemplatesOptions = {
  showSuccessToasts: true,
  showErrorToasts: true,
};

/**
 * Hook for managing project templates
 */
export function useProjectTemplates(options: UseProjectTemplatesOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const { showToast } = useAppToast();

  // Helper function to handle errors
  const handleError = useCallback((error: unknown, customMessage: string) => {
    console.error(customMessage, error);
    const errorType = categorizeError(error);
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : (error instanceof Error ? error.message : customMessage),
      type: errorType,
      timestamp: new Date()
    };
    setError(errorInfo);
    
    if (mergedOptions.showErrorToasts) {
      showToast({
        title: errorType.toUpperCase() || 'Error',
        description: errorInfo.message,
        variant: 'destructive',
      });
    }
    return errorInfo;
  }, [mergedOptions.showErrorToasts, showToast]);

  // Helper function to show success toast
  const showSuccess = useCallback((message: string) => {
    if (mergedOptions.showSuccessToasts) {
      showToast({
        title: 'Success',
        description: message,
      });
    }
  }, [mergedOptions.showSuccessToasts, showToast]);

  /**
   * Get all project templates
   */
  const getAllTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This command will be implemented in the Tauri backend later
      const templates = await invoke<ProjectTemplate[]>('get_all_templates');
      return templates;
    } catch (err) {
      handleError(err, 'Failed to fetch project templates');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Get a template by ID
   */
  const getTemplateById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This command will be implemented in the Tauri backend later
      const template = await invoke<ProjectTemplate>('get_template_by_id', { id });
      return template;
    } catch (err) {
      handleError(err, `Failed to fetch template with ID: ${id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Create a new project template
   */
  const createTemplate = useCallback(async (template: Omit<ProjectTemplate, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sanitize template text fields
      const sanitizedTemplate = {
        ...template,
        name: sanitizeString(template.name),
        description: sanitizeString(template.description),
      };

      // This command will be implemented in the Tauri backend later
      const createdTemplate = await invoke<ProjectTemplate>('create_template', { template: sanitizedTemplate });
      showSuccess('Template created successfully');
      return createdTemplate;
    } catch (err) {
      handleError(err, 'Failed to create template');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(async (id: string, updates: Partial<Omit<ProjectTemplate, 'id'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sanitize template text fields
      const sanitizedUpdates = {
        ...updates,
        name: updates.name ? sanitizeString(updates.name) : undefined,
        description: updates.description ? sanitizeString(updates.description) : undefined,
      };

      // This command will be implemented in the Tauri backend later
      const updatedTemplate = await invoke<ProjectTemplate>('update_template', { id, updates: sanitizedUpdates });
      showSuccess('Template updated successfully');
      return updatedTemplate;
    } catch (err) {
      handleError(err, `Failed to update template with ID: ${id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This command will be implemented in the Tauri backend later
      await invoke('delete_template', { id });
      showSuccess('Template deleted successfully');
      return true;
    } catch (err) {
      handleError(err, `Failed to delete template with ID: ${id}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  /**
   * Create a new project from a template
   */
  const createProjectFromTemplate = useCallback(async (templateId: string, projectName: string, projectDescription?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This command will be implemented in the Tauri backend later
      const project = await invoke('create_project_from_template', { 
        templateId, 
        name: sanitizeString(projectName), 
        description: projectDescription ? sanitizeString(projectDescription) : undefined 
      });
      
      showSuccess('Project created successfully from template');
      return project;
    } catch (err) {
      handleError(err, 'Failed to create project from template');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  return {
    isLoading,
    error,
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createProjectFromTemplate
  };
}
