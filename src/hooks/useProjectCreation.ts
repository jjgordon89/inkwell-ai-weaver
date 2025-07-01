import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeCommand, createMutationOptions } from '@/hooks/queries/queryUtils';
import { projectKeys } from '@/hooks/queries/useProjectQueries';
import { useAppToast } from '@/hooks/useAppToast';
import { useDocumentStructureGenerator } from '@/hooks/useDocumentStructureGenerator';
import { sanitizeString } from '@/utils/stringUtils';
import type { Project, DocumentNode } from '@/types/document';
import type { CreateProjectInput } from '@/types/projectTypes';
import { useProjectTemplates } from './useProjectTemplates';

// Define structure settings interface
export interface ProjectStructureSettings {
  chapterCount?: number;
  scenesPerChapter?: number;
  actCount?: number;
  poemCount?: number;
  researchSections?: number;
}

/**
 * Enhanced hook to create a new project with document structure
 */
export function useProjectCreation() {
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { generateDocuments } = useDocumentStructureGenerator();
  const { getTemplateById } = useProjectTemplates();
  
  return useMutation(
    createMutationOptions(
      async (data: {
        project: CreateProjectInput;
        templateId?: string;
        structureSettings?: ProjectStructureSettings;
      }) => {
        // Sanitize user input
        const sanitizedProject: CreateProjectInput = {
          ...data.project,
          name: sanitizeString(data.project.name),
          description: sanitizeString(data.project.description ?? ""),
        };
        
        // Fetch the template if a templateId is provided
        let template = null;
        if (data.templateId) {
          try {
            template = await getTemplateById(data.templateId);
          } catch (error) {
            console.warn(`Template with ID ${data.templateId} not found, using default structure`);
          }
        }
        
        // Generate document structure based on project type, template, and custom settings
        const documentStructure = generateDocuments(
          sanitizedProject.structure,
          { 
            template,
            ...data.structureSettings
          }
        );
        
        // Create project with document structure
        return invokeCommand<Project>('create_project', { 
          project: sanitizedProject,
          documentStructure 
        });
      },
      {
        onSuccess: (newProject: Project) => {
          // Invalidate projects list query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          
          // Optionally add the new project to the cache
          queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
          
          // Show success toast
          showToast({
            title: 'Success',
            description: 'Project created successfully with document structure',
          });
        },
        onError: (error: Error) => {
          showToast({
            title: 'Error',
            description: `Failed to create project: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}
