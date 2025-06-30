import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { DocumentNode, NewDocument, UpdateDocumentPayload, DocumentTreeOperation } from '@/types/document';
import { useProject } from '@/contexts/useProject';
import { sanitizeString } from '@/utils/stringUtils';
import { categorizeError, ErrorInfo, ErrorType } from '@/utils/errorUtils';
import { useAppToast } from './useAppToast';

export interface UseDocumentOptions {
  showSuccessToasts?: boolean;
  showErrorToasts?: boolean;
}

const defaultOptions: UseDocumentOptions = {
  showSuccessToasts: true,
  showErrorToasts: true,
};

export function useDocument(options: UseDocumentOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const { activeProjectId } = useProject();
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

  // Get all documents for the active project
  const getProjectDocuments = useCallback(async (projectId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = projectId ?? activeProjectId;
      if (!id) {
        throw new Error('No active project ID available');
      }
      
      const documents = await invoke<DocumentNode[]>('get_project_documents', { projectId: id });
      return documents;
    } catch (err) {
      handleError(err, 'Failed to fetch project documents');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, handleError]);

  // Get a single document by ID
  const getDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const document = await invoke<DocumentNode>('get_document', { id: documentId });
      return document;
    } catch (err) {
      handleError(err, `Failed to fetch document with ID: ${documentId}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Create a new document
  const createDocument = useCallback(async (newDocument: NewDocument) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sanitize document text fields to prevent XSS
      const sanitizedDocument = {
        ...newDocument,
        title: sanitizeString(newDocument.title),
        content: newDocument.content ? sanitizeString(newDocument.content) : undefined,
        synopsis: newDocument.synopsis ? sanitizeString(newDocument.synopsis) : undefined,
      };

      const projectId = sanitizedDocument.parentId?.split('/')[0] ?? activeProjectId;
      if (!projectId) {
        throw new Error('No project ID available');
      }

      const document = await invoke<DocumentNode>('create_document', { 
        document: {
          ...sanitizedDocument,
          projectId,
        } 
      });
      
      showSuccess('Document created successfully');
      return document;
    } catch (err) {
      handleError(err, 'Failed to create document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, handleError, showSuccess]);

  // Update an existing document
  const updateDocument = useCallback(async (payload: UpdateDocumentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sanitize document text fields to prevent XSS
      const sanitizedUpdates = {
        ...payload.updates,
        title: payload.updates.title ? sanitizeString(payload.updates.title) : undefined,
        content: payload.updates.content ? sanitizeString(payload.updates.content) : undefined,
        synopsis: payload.updates.synopsis ? sanitizeString(payload.updates.synopsis) : undefined,
      };

      const document = await invoke<DocumentNode>('update_document', { 
        document: {
          id: payload.id,
          ...sanitizedUpdates,
        } 
      });
      
      return document;
    } catch (err) {
      handleError(err, `Failed to update document with ID: ${payload.id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await invoke('delete_document', { id: documentId });
      showSuccess('Document deleted successfully');
      return true;
    } catch (err) {
      handleError(err, `Failed to delete document with ID: ${documentId}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Perform a document tree operation (add, update, delete, move)
  const performTreeOperation = useCallback(async (operation: DocumentTreeOperation) => {
    setIsLoading(true);
    setError(null);
    try {
      // Handle sanitization based on operation type
      let sanitizedOperation: DocumentTreeOperation = operation;
      
      if (operation.type === 'add' && operation.document) {
        sanitizedOperation = {
          ...operation,
          document: {
            ...operation.document,
            title: sanitizeString(operation.document.title),
            content: operation.document.content ? sanitizeString(operation.document.content) : undefined,
            synopsis: operation.document.synopsis ? sanitizeString(operation.document.synopsis) : undefined,
          },
        };
      } else if (operation.type === 'update' && operation.updates) {
        sanitizedOperation = {
          ...operation,
          updates: {
            ...operation.updates,
            title: operation.updates.title ? sanitizeString(operation.updates.title) : undefined,
            content: operation.updates.content ? sanitizeString(operation.updates.content) : undefined,
            synopsis: operation.updates.synopsis ? sanitizeString(operation.updates.synopsis) : undefined,
          },
        };
      }
      
      await invoke('document_tree_operation', { operation: sanitizedOperation });
      
      // Show success message based on operation type
      const operationMessages = {
        add: 'Document added successfully',
        update: 'Document updated successfully',
        delete: 'Document deleted successfully',
        move: 'Document moved successfully',
      };
      
      showSuccess(operationMessages[operation.type]);
      return true;
    } catch (err) {
      handleError(err, `Failed to perform tree operation: ${operation.type}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Record writing session for analytics
  const recordWritingSession = useCallback(async (
    projectId: string, 
    documentIds: string[], 
    startTime: Date, 
    endTime: Date, 
    wordCount: number
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // Duration in seconds
      const wordCountVal = Math.max(0, wordCount); // Ensure non-negative
      const wordsPerMinute = duration > 0 ? (wordCountVal / (duration / 60)) : 0;
      
      await invoke('record_writing_session', {
        session: {
          projectId,
          documentIds,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          wordCount: wordCountVal,
          wordsPerMinute,
        }
      });
      
      return true;
    } catch (err) {
      handleError(err, 'Failed to record writing session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Get project analytics data
  const getProjectAnalytics = useCallback(async (projectId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = projectId ?? activeProjectId;
      if (!id) {
        throw new Error('No project ID available');
      }
      
      const analyticsJson = await invoke<string>('get_project_analytics', { projectId: id });
      return JSON.parse(analyticsJson);
    } catch (err) {
      handleError(err, 'Failed to fetch project analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, handleError]);

  return {
    isLoading,
    error,
    getProjectDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    performTreeOperation,
    recordWritingSession,
    getProjectAnalytics,
  };
}
