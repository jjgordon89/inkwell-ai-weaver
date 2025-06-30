import { useEffect } from 'react';
import { listen, UnlistenFn, Event } from '@tauri-apps/api/event';
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys } from './queries/useProjectQueries';
import { documentKeys } from './queries/useDocumentQueries';
import { permissionKeys } from './queries/useDocumentPermissions';

type EventHandler<T = unknown> = (event: Event<T>) => void;

/**
 * Hook that subscribes to Tauri backend events and updates the query cache accordingly
 */
export function useTauriEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const listeners: UnlistenFn[] = [];

    // Project-related events
    const setupProjectListeners = async () => {
      // Project created event
      const unlisten1 = await listen('project-created', (event) => {
        // Invalidate the projects list
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      });
      listeners.push(unlisten1);

      // Project updated event
      const unlisten2 = await listen('project-updated', (event) => {
        const projectId = event.payload as string;
        // Update the specific project in the cache
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        // Also invalidate the lists that might include this project
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      });
      listeners.push(unlisten2);

      // Project deleted event
      const unlisten3 = await listen('project-deleted', (event) => {
        const projectId = event.payload as string;
        // Remove the project from the cache
        queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
        // Invalidate the lists
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      });
      listeners.push(unlisten3);
    };

    // Document-related events
    const setupDocumentListeners = async () => {
      // Document created event
      const unlisten1 = await listen('document-created', (event) => {
        const { documentId, projectId } = event.payload as { documentId: string; projectId: string };
        // Invalidate the project's document tree
        queryClient.invalidateQueries({ queryKey: documentKeys.tree(projectId) });
      });
      listeners.push(unlisten1);

      // Document updated event
      const unlisten2 = await listen('document-updated', (event) => {
        const { documentId, projectId } = event.payload as { documentId: string; projectId: string };
        // Invalidate the specific document in the cache
        queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
        // Also invalidate the document tree that includes this document
        queryClient.invalidateQueries({ queryKey: documentKeys.tree(projectId) });
      });
      listeners.push(unlisten2);

      // Document deleted event
      const unlisten3 = await listen('document-deleted', (event) => {
        const { documentId, projectId } = event.payload as { documentId: string; projectId: string };
        // Remove the document from the cache
        queryClient.removeQueries({ queryKey: documentKeys.detail(documentId) });
        // Invalidate the document tree
        queryClient.invalidateQueries({ queryKey: documentKeys.tree(projectId) });
      });
      listeners.push(unlisten3);

      // Document tree updated event (for moves, reorders, etc.)
      const unlisten4 = await listen('document-tree-updated', (event) => {
        const projectId = event.payload as string;
        // Invalidate the document tree
        queryClient.invalidateQueries({ queryKey: documentKeys.tree(projectId) });
      });
      listeners.push(unlisten4);
    };

    // Document permissions events
    const setupPermissionsListeners = async () => {
      // Document permissions updated event
      const unlisten = await listen('document-permissions-updated', (event) => {
        const documentId = event.payload as string;
        // Invalidate the document permissions
        queryClient.invalidateQueries({ queryKey: permissionKeys.documentPermissions(documentId) });
        // Also invalidate the document itself as metadata might change
        queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      });
      listeners.push(unlisten);
    };

    // Setup all listeners
    setupProjectListeners();
    setupDocumentListeners();
    setupPermissionsListeners();

    // Cleanup function to remove all listeners
    return () => {
      listeners.forEach(unlisten => unlisten());
    };
  }, [queryClient]);
}

/**
 * A utility hook to listen for a specific Tauri event
 */
export function useTauriEvent<T = unknown>(event: string, handler: EventHandler<T>) {
  useEffect(() => {
    let unlisten: UnlistenFn;
    
    const setupListener = async () => {
      unlisten = await listen<T>(event, handler);
    };
    
    setupListener();
    
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [event, handler]);
}
