import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { invokeCommand, createQueryOptions, createMutationOptions } from './queryUtils';
import { documentKeys } from './useDocumentQueries';
import type { DocumentPermissions } from '@/types/document';

// Define document permissions key types
type PermissionsQueryKey = readonly [string, ...unknown[]];

/**
 * Query keys for document permission-related queries
 */
export const permissionKeys = {
  all: ['permissions'] as const,
  documentPermissions: (documentId: string) => 
    [...permissionKeys.all, 'document', documentId] as const,
  userPermissions: (userId: string) => 
    [...permissionKeys.all, 'user', userId] as const,
};

/**
 * Hook to fetch permissions for a document
 */
export function useDocumentPermissions(documentId?: string) {
  const { toast } = useToast();
  
  return useQuery(
    createQueryOptions(
      () => {
        if (!documentId) throw new Error('Document ID is required');
        return invokeCommand<DocumentPermissions>('get_document_permissions', { documentId });
      },
      permissionKeys.documentPermissions(documentId || '') as unknown as PermissionsQueryKey,
      {
        enabled: Boolean(documentId),
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 30 * 1000, // 30 seconds
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to fetch document permissions: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to update document permissions
 */
export function useUpdateDocumentPermissions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation(
    createMutationOptions(
      (permissions: DocumentPermissions) => 
        invokeCommand<DocumentPermissions>('update_document_permissions', { permissions }),
      {
        onSuccess: (updatedPermissions) => {
          // Update the permissions in the cache
          queryClient.setQueryData(
            permissionKeys.documentPermissions(updatedPermissions.documentId) as unknown as PermissionsQueryKey, 
            updatedPermissions
          );
          
          // Invalidate the document since permissions might affect its metadata
          queryClient.invalidateQueries({ 
            queryKey: documentKeys.detail(updatedPermissions.documentId)
          });
          
          toast({
            title: 'Success',
            description: 'Document permissions updated successfully',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to update document permissions: ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    )
  );
}

/**
 * Hook to check if the current user can access a document with a specific permission level
 */
export function useDocumentAccess(documentId?: string, requiredLevel: 'read' | 'comment' | 'edit' | 'admin' = 'read') {
  const { data: permissions, isLoading, error } = useDocumentPermissions(documentId);
  const { toast } = useToast();
  
  // Mock current user ID - In a real app, get this from auth context
  const currentUserId = 'current-user-id';
  
  // Access levels ordered from lowest to highest permission
  const accessLevels = ['read', 'comment', 'edit', 'admin'];
  
  // Function to check if user has required access level
  const hasAccess = () => {
    if (!permissions || !documentId) return false;
    
    // Check if user is the owner
    if (permissions.ownerId === currentUserId) return true;
    
    // Check user permissions
    const userPermission = permissions.userPermissions[currentUserId];
    if (userPermission && userPermission.accepted) {
      // Check if user has sufficient access level
      const userLevel = userPermission.accessLevel;
      const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
      const userLevelIndex = accessLevels.indexOf(userLevel);
      
      if (userLevelIndex >= requiredLevelIndex) return true;
    }
    
    // Check link sharing
    if (permissions.linkSharing.enabled) {
      const linkLevel = permissions.linkSharing.accessLevel;
      const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
      const linkLevelIndex = accessLevels.indexOf(linkLevel);
      
      if (linkLevelIndex >= requiredLevelIndex) return true;
    }
    
    // Check public sharing
    if (permissions.publicSharing.enabled) {
      const publicLevel = permissions.publicSharing.accessLevel;
      const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
      const publicLevelIndex = accessLevels.indexOf(publicLevel);
      
      if (publicLevelIndex >= requiredLevelIndex) return true;
    }
    
    return false;
  };
  
  return {
    hasAccess: hasAccess(),
    isLoading,
    error,
    permissions
  };
}

/**
 * Hook to share a document with a user
 */
export function useShareDocument() {
  const updatePermissions = useUpdateDocumentPermissions();
  const { toast } = useToast();
  
  const shareWithUser = async (
    documentId: string, 
    userId: string, 
    accessLevel: 'read' | 'comment' | 'edit' | 'admin'
  ) => {
    try {
      // First get current permissions
      const currentPermissions = await invokeCommand<DocumentPermissions>(
        'get_document_permissions', 
        { documentId }
      );
      
      // Update user permissions
      const updatedPermissions = {
        ...currentPermissions,
        userPermissions: {
          ...currentPermissions.userPermissions,
          [userId]: {
            accessLevel,
            grantedAt: new Date().toISOString(),
            accepted: false,
          }
        }
      };
      
      // Update permissions
      await updatePermissions.mutateAsync(updatedPermissions);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to share document: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    shareWithUser,
    isSharing: updatePermissions.isPending,
    error: updatePermissions.error
  };
}

/**
 * Hook to enable/disable link sharing for a document
 */
export function useLinkSharing() {
  const updatePermissions = useUpdateDocumentPermissions();
  const { toast } = useToast();
  
  const updateLinkSharing = async (
    documentId: string, 
    enabled: boolean,
    accessLevel: 'read' | 'comment' | 'edit' = 'read',
    passwordProtected: boolean = false,
    expiresAt?: string
  ) => {
    try {
      // First get current permissions
      const currentPermissions = await invokeCommand<DocumentPermissions>(
        'get_document_permissions', 
        { documentId }
      );
      
      // Generate a new link token if enabling
      const linkToken = enabled 
        ? currentPermissions.linkSharing.linkToken || generateLinkToken() 
        : undefined;
      
      // Update link sharing settings
      const updatedPermissions = {
        ...currentPermissions,
        linkSharing: {
          enabled,
          accessLevel,
          linkToken,
          passwordProtected,
          expiresAt
        }
      };
      
      // Update permissions
      await updatePermissions.mutateAsync(updatedPermissions);
      
      return linkToken;
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update link sharing: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Generate a random token for the link
  const generateLinkToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  return {
    updateLinkSharing,
    isUpdating: updatePermissions.isPending,
    error: updatePermissions.error
  };
}

/**
 * Hook to enable/disable public sharing for a document
 */
export function usePublicSharing() {
  const updatePermissions = useUpdateDocumentPermissions();
  const { toast } = useToast();
  
  const updatePublicSharing = async (
    documentId: string, 
    enabled: boolean,
    accessLevel: 'read' | 'comment' = 'read',
    allowIndexing: boolean = false
  ) => {
    try {
      // First get current permissions
      const currentPermissions = await invokeCommand<DocumentPermissions>(
        'get_document_permissions', 
        { documentId }
      );
      
      // Update public sharing settings
      const updatedPermissions = {
        ...currentPermissions,
        publicSharing: {
          enabled,
          accessLevel,
          allowIndexing
        }
      };
      
      // Update permissions
      await updatePermissions.mutateAsync(updatedPermissions);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update public sharing: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    updatePublicSharing,
    isUpdating: updatePermissions.isPending,
    error: updatePermissions.error
  };
}

/**
 * Hook to transfer document ownership to another user
 */
export function useTransferOwnership() {
  const updatePermissions = useUpdateDocumentPermissions();
  const { toast } = useToast();
  
  const transferOwnership = async (documentId: string, newOwnerId: string) => {
    try {
      // First get current permissions
      const currentPermissions = await invokeCommand<DocumentPermissions>(
        'get_document_permissions', 
        { documentId }
      );
      
      // Make sure old owner still has access as admin
      const oldOwnerId = currentPermissions.ownerId;
      const updatedUserPermissions = {
        ...currentPermissions.userPermissions
      };
      
      // Add old owner to user permissions with admin access
      updatedUserPermissions[oldOwnerId] = {
        accessLevel: 'admin',
        grantedAt: new Date().toISOString(),
        accepted: true,
      };
      
      // Remove new owner from user permissions if present
      delete updatedUserPermissions[newOwnerId];
      
      // Update permissions
      const updatedPermissions = {
        ...currentPermissions,
        ownerId: newOwnerId,
        userPermissions: updatedUserPermissions
      };
      
      await updatePermissions.mutateAsync(updatedPermissions);
      
      toast({
        title: 'Success',
        description: 'Document ownership transferred successfully',
        variant: 'default',
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to transfer ownership: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    transferOwnership,
    isTransferring: updatePermissions.isPending,
    error: updatePermissions.error
  };
}
