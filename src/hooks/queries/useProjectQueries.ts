import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { invokeCommand, QueryKeyFactory, createQueryOptions, createMutationOptions, filtersToRecord } from './queryUtils';
import type { Project } from '@/types/document';
import type { CreateProjectInput, ProjectFilters, UpdateProjectInput } from '@/types/projectTypes';

/**
 * Query keys for project-related queries
 */
export const projectKeys: QueryKeyFactory = {
  all: ['projects'] as const,
  lists: (...args: unknown[]) => [...projectKeys.all, 'list', ...args] as const,
  list: (filters?: Record<string, unknown>) => [...projectKeys.lists(filters)] as const,
  details: (...args: unknown[]) => [...projectKeys.all, 'detail', ...args] as const,
  detail: (id: string) => [...projectKeys.details(id)] as const,
};

/**
 * Hook to fetch all projects with optional filters
 */
export function useProjects(filters?: ProjectFilters) {
  const { toast } = useToast();
  
  return useQuery(
    createQueryOptions(
      () => invokeCommand<Project[]>('get_all_projects', filtersToRecord(filters)),
      projectKeys.list(filtersToRecord(filters)),
      {
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 30 * 1000, // 30 seconds
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to load projects: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id: string) {
  const { toast } = useToast();
  
  return useQuery(
    createQueryOptions(
      () => {
        if (!id) throw new Error('Project ID is required');
        return invokeCommand<Project>('get_project', { id });
      },
      projectKeys.detail(id),
      {
        enabled: Boolean(id), // Only run query if ID is provided
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 30 * 1000, // 30 seconds
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to load project: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      (project: CreateProjectInput) => invokeCommand<Project>('create_project', { project }),
      {
        onSuccess: (newProject) => {
          // Invalidate projects list query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          
          // Optionally add the new project to the cache
          queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
          
          // Show success toast
          toast({
            title: 'Success',
            description: 'Project created successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to create project: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ id, data }: { id: string; data: UpdateProjectInput }) => 
        invokeCommand<Project>('update_project', { id, data }),
      {
        onSuccess: (updatedProject) => {
          // Update the project in the cache
          queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
          
          // Invalidate projects list to reflect the update
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          
          // Show success toast
          toast({
            title: 'Success',
            description: 'Project updated successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to update project: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      (id: string) => invokeCommand<boolean>('delete_project', { id }),
      {
        onSuccess: (_, id) => {
          // Remove the project from the cache
          queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
          
          // Invalidate projects list to reflect the deletion
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          
          // Show success toast
          toast({
            title: 'Success',
            description: 'Project deleted successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to delete project: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to archive/unarchive a project
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ id, archived }: { id: string; archived: boolean }) => 
        invokeCommand<Project>('update_project', { 
          id, 
          data: { status: archived ? 'archived' : 'active' } 
        }),
      {
        onSuccess: (updatedProject) => {
          // Update the project in the cache
          queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
          
          // Invalidate projects list to reflect the update
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          
          const action = updatedProject.status === 'archived' ? 'archived' : 'unarchived';
          toast({
            title: 'Success',
            description: `Project ${action} successfully`,
            variant: 'default',
          });
        },
        onError: (error: Error, variables) => {
          const action = variables.archived ? 'archive' : 'unarchive';
          toast({
            title: 'Error',
            description: `Failed to ${action} project: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook for batch operations on projects
 */
export function useBatchProjectOperations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ 
        ids, 
        operation, 
        value 
      }: { 
        ids: string[]; 
        operation: 'archive' | 'unarchive' | 'delete' | 'changeStatus'; 
        value?: string;
      }) => 
        invokeCommand<boolean>('batch_project_operation', { ids, operation, value }),
      {
        onSuccess: (_, variables) => {
          // Invalidate all affected project details
          variables.ids.forEach(id => {
            if (variables.operation !== 'delete') {
              // For non-delete operations, invalidate each project
              queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
            } else {
              // For delete, remove from cache
              queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
            }
          });
          
          // Invalidate projects list
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          
          // Show success message based on operation
          let successMessage = '';
          switch (variables.operation) {
            case 'archive':
              successMessage = 'Projects archived successfully';
              break;
            case 'unarchive':
              successMessage = 'Projects unarchived successfully';
              break;
            case 'delete':
              successMessage = 'Projects deleted successfully';
              break;
            case 'changeStatus':
              successMessage = `Projects status updated to ${variables.value}`;
              break;
          }
          
          toast({
            title: 'Success',
            description: successMessage,
            variant: 'default',
          });
        },
        onError: (error: Error, variables) => {
          // Error message based on operation
          let errorMessage = '';
          switch (variables.operation) {
            case 'archive':
              errorMessage = 'Failed to archive projects';
              break;
            case 'unarchive':
              errorMessage = 'Failed to unarchive projects';
              break;
            case 'delete':
              errorMessage = 'Failed to delete projects';
              break;
            case 'changeStatus':
              errorMessage = 'Failed to update project status';
              break;
          }
          
          toast({
            title: 'Error',
            description: `${errorMessage}: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}
