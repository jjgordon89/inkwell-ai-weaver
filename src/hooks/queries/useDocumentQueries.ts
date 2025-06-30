import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { invokeCommand, createQueryOptions, createMutationOptions } from './queryUtils';
import type { DocumentNode, NewDocument, UpdateDocumentPayload, DocumentTreeOperation } from '@/types/document';

// Define document key types
type DocumentQueryKey = readonly [string, ...unknown[]];

/**
 * Query keys for document-related queries
 */
export const documentKeys = {
  all: ['documents'] as const,
  lists: (...args: unknown[]) => [...documentKeys.all, 'list', ...args] as const,
  list: (projectId?: string) => [...documentKeys.lists({ projectId })] as const,
  details: (...args: unknown[]) => [...documentKeys.all, 'detail', ...args] as const,
  detail: (id: string) => [...documentKeys.details(id)] as const,
  tree: (projectId: string) => [...documentKeys.all, 'tree', projectId] as const,
};

/**
 * Hook to fetch all documents for a project
 */
export function useDocuments(projectId?: string) {
  const { toast } = useToast();
  
  return useQuery(
    createQueryOptions(
      () => {
        if (!projectId) throw new Error('Project ID is required');
        return invokeCommand<DocumentNode[]>('get_project_documents', { projectId });
      },
      documentKeys.list(projectId) as unknown as DocumentQueryKey,
      {
        enabled: Boolean(projectId),
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 30 * 1000, // 30 seconds
      }
    )
  );
}

/**
 * Hook to fetch a single document by ID
 */
export function useDocument(id?: string) {
  const { toast } = useToast();
  
  return useQuery(
    createQueryOptions(
      () => {
        if (!id) throw new Error('Document ID is required');
        return invokeCommand<DocumentNode>('get_document', { id });
      },
      documentKeys.detail(id || '') as unknown as DocumentQueryKey,
      {
        enabled: Boolean(id),
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 30 * 1000, // 30 seconds
      }
    )
  );
}

/**
 * Hook to fetch the document tree for a project
 */
export function useDocumentTree(projectId?: string) {
  const { toast } = useToast();
  
  return useQuery(
    createQueryOptions(
      () => {
        if (!projectId) throw new Error('Project ID is required');
        return invokeCommand<DocumentNode[]>('get_document_tree', { projectId });
      },
      documentKeys.tree(projectId || '') as unknown as DocumentQueryKey,
      {
        enabled: Boolean(projectId),
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 30 * 1000, // 30 seconds
      }
    )
  );
}

/**
 * Hook to create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ document, projectId }: { document: NewDocument; projectId: string }) => 
        invokeCommand<DocumentNode>('create_document', { document, projectId }),
      {
        onSuccess: (newDocument, variables) => {
          // Invalidate document list for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.list(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          // Invalidate document tree for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.tree(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          // Add the new document to the cache
          queryClient.setQueryData(documentKeys.detail(newDocument.id), newDocument);
          
          toast({
            title: 'Success',
            description: 'Document created successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to create document: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to update an existing document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ id, updates, projectId }: UpdateDocumentPayload & { projectId: string }) => 
        invokeCommand<DocumentNode>('update_document', { id, updates }),
      {
        onSuccess: (updatedDocument, variables) => {
          // Update the document in the cache
          queryClient.setQueryData(documentKeys.detail(updatedDocument.id), updatedDocument);
          
          // Invalidate document list for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.list(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          // Invalidate document tree for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.tree(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          toast({
            title: 'Success',
            description: 'Document updated successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to update document: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ id, projectId }: { id: string; projectId: string }) => 
        invokeCommand<boolean>('delete_document', { id }),
      {
        onSuccess: (_, variables) => {
          // Remove the document from the cache
          queryClient.removeQueries({ queryKey: documentKeys.detail(variables.id) });
          
          // Invalidate document list for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.list(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          // Invalidate document tree for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.tree(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          toast({
            title: 'Success',
            description: 'Document deleted successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to delete document: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook for document tree operations
 */
export function useDocumentTreeOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      ({ operation, projectId }: { operation: DocumentTreeOperation; projectId: string }) => 
        invokeCommand<boolean>('document_tree_operation', { operation, projectId }),
      {
        onSuccess: (_, variables) => {
          // Invalidate document list for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.list(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          // Invalidate document tree for the project
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.tree(variables.projectId) as unknown as DocumentQueryKey 
          });
          
          // Determine operation type for success message
          let successMessage = 'Document tree updated successfully';
          switch (variables.operation.type) {
            case 'move':
              successMessage = 'Document moved successfully';
              break;
            case 'reorder':
              successMessage = 'Documents reordered successfully';
              break;
            case 'duplicate':
              successMessage = 'Document duplicated successfully';
              break;
            case 'merge':
              successMessage = 'Documents merged successfully';
              break;
            case 'split':
              successMessage = 'Document split successfully';
              break;
            case 'importBranch':
              successMessage = 'Documents imported successfully';
              break;
            case 'batchMove':
              successMessage = 'Documents moved successfully';
              break;
          }
          
          toast({
            title: 'Success',
            description: successMessage,
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to update document structure: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}
