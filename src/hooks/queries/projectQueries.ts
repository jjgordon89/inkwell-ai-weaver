import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useProjectDatabase, ProjectFilter, ProjectRecord } from '@/hooks/useProjectDatabase';
import { sanitizeString } from '@/utils/stringUtils';

/**
 * Query keys for project-related queries
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilter) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: () => [...projectKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all projects with optional filters
 */
export function useProjects(filters?: Record<string, any>) {
  const { toast } = useToast();
  const { getProjects, isReady, isLoading: dbLoading } = useProjectDatabase();
  
  // Convert generic filters to ProjectFilter
  const projectFilters: ProjectFilter = {};
  
  if (filters) {
    if (filters.searchTerm) {
      projectFilters.searchTerm = sanitizeString(filters.searchTerm);
    }
    
    if (filters.status && filters.status !== 'all') {
      projectFilters.status = filters.status;
    }
    
    if (filters.structure && filters.structure !== 'all') {
      projectFilters.structure = filters.structure;
    }
    
    if (filters.template !== undefined && filters.template !== 'all') {
      projectFilters.template = filters.template === 'custom' ? null : filters.template;
    }
    
    if (filters.sortBy) {
      projectFilters.sortBy = filters.sortBy;
    }
    
    if (filters.sortOrder) {
      projectFilters.sortOrder = filters.sortOrder;
    }
    
    if (filters.limit) {
      projectFilters.limit = Number(filters.limit);
    }
    
    if (filters.offset !== undefined) {
      projectFilters.offset = Number(filters.offset);
    }
  }
  
  return useQuery({
    queryKey: projectKeys.list(projectFilters),
    queryFn: () => getProjects(projectFilters),
    enabled: isReady,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to load projects: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id?: string) {
  const { toast } = useToast();
  const { getProject, isReady } = useProjectDatabase();
  
  return useQuery({
    queryKey: projectKeys.detail(id || ''),
    queryFn: () => {
      if (!id) {
        throw new Error('Project ID is required');
      }
      return getProject(id);
    },
    enabled: isReady && Boolean(id),
    staleTime: 30 * 1000, // 30 seconds
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to load project: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { createProject } = useProjectDatabase();
  
  return useMutation({
    mutationFn: (project: Omit<ProjectRecord, 'id' | 'createdAt' | 'lastModified'>) => {
      return createProject(project);
    },
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
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { updateProject } = useProjectDatabase();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ProjectRecord, 'id' | 'createdAt'>> }) => {
      return updateProject(id, data);
    },
    onSuccess: (updatedProject) => {
      if (!updatedProject) return;
      
      // Update the project in the cache
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
      
      // Invalidate projects list to reflect the update
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // Invalidate project stats
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
      
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
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { deleteProject } = useProjectDatabase();
  
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return deleteProject(id);
    },
    onSuccess: (result) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(result.id) });
      
      // Invalidate project stats
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
      
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
  });
}

/**
 * Hook to get project statistics
 */
export function useProjectStats() {
  const { toast } = useToast();
  const { getProjectStats, isReady } = useProjectDatabase();
  
  return useQuery({
    queryKey: projectKeys.stats(),
    queryFn: () => getProjectStats(),
    enabled: isReady,
    staleTime: 60 * 1000, // 1 minute
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to load project statistics: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
