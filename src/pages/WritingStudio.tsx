
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/tauri';
import { useProject } from '@/contexts/useProject';
import { useToast } from '@/hooks/use-toast';
import WritingStudioLayout from '@/components/layout/WritingStudioLayout';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { DocumentNode } from '@/types/document';

const WritingStudio = () => {
  const { state, dispatch } = useProject();
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default document structure for new projects
  const initializeDefaultDocumentStructure = useCallback(async (projectId: string) => {
    try {
      // Create a root Manuscript folder
      const manuscriptFolder: Partial<DocumentNode> = {
        title: 'Manuscript',
        type: 'folder',
        status: 'draft',
        wordCount: 0,
        labels: ['permanent'],
        position: 0,
        metadata: {
          importance: 'high' as const,
          notes: 'This is the main manuscript folder and cannot be deleted.'
        }
      };
      
      // Create the folder in the backend
      const createdFolder = await invoke<DocumentNode>(
        'create_document', 
        { 
          projectId, 
          document: manuscriptFolder,
          parentId: null
        }
      );
      
      // Create a sample chapter
      const chapter: Partial<DocumentNode> = {
        title: 'Chapter 1: The Beginning',
        type: 'chapter',
        status: 'first-draft',
        wordCount: 0,
        labels: ['opening'],
        position: 0,
        content: 'Start writing your story here...',
        synopsis: 'Opening chapter that introduces the main character and setting.',
        metadata: {
          POV: 'Third Person',
          characters: [],
          keywords: ['introduction', 'setting']
        }
      };
      
      // Create the chapter in the backend
      const createdChapter = await invoke<DocumentNode>(
        'create_document', 
        { 
          projectId, 
          document: chapter,
          parentId: createdFolder.id
        }
      );
      
      // Create a Research folder
      const researchFolder: Partial<DocumentNode> = {
        title: 'Research',
        type: 'folder',
        status: 'not-started',
        wordCount: 0,
        labels: [],
        position: 1
      };
      
      // Create the folder in the backend
      const createdResearchFolder = await invoke<DocumentNode>(
        'create_document', 
        { 
          projectId, 
          document: researchFolder,
          parentId: null
        }
      );
      
      // Get the updated document tree
      const updatedDocumentTree = await invoke<DocumentNode[]>('get_document_tree', { projectId });
      dispatch({ type: 'SET_DOCUMENT_TREE', payload: updatedDocumentTree });
      
      toast({
        title: 'Success',
        description: 'Created default document structure',
      });
      
    } catch (error) {
      console.error('Error initializing document structure:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to initialize document structure';
      
      if (error instanceof Error) {
        // If it's a standard error with message
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        // If it's a string error
        errorMessage += `: ${error}`;
      } else if (error && typeof error === 'object' && 'message' in error) {
        // If it's a Tauri error object
        errorMessage += `: ${(error as { message: string }).message}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [dispatch, toast]);

  // Load project and document structure when component mounts
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        toast({
          title: 'Error',
          description: 'No project ID provided',
          variant: 'destructive',
        });
        navigate('/projects');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get project details from backend
        const project = await invoke('get_project', { id: projectId });
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
        
        // Get document tree for the project
        const documentTree = await invoke('get_document_tree', { projectId });
        
        if (Array.isArray(documentTree) && documentTree.length > 0) {
          dispatch({ type: 'SET_DOCUMENT_TREE', payload: documentTree });
        } else {
          // Initialize with default document structure if none exists
          await initializeDefaultDocumentStructure(projectId);
        }
        
      } catch (error) {
        console.error('Error loading project data:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = 'Failed to load project data';
        
        if (error instanceof Error) {
          // If it's a standard error with message
          errorMessage += `: ${error.message}`;
        } else if (typeof error === 'string') {
          // If it's a string error
          errorMessage += `: ${error}`;
        } else if (error && typeof error === 'object' && 'message' in error) {
          // If it's a Tauri error object
          errorMessage += `: ${(error as { message: string }).message}`;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Navigate back to projects page on critical errors
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjectData();
  }, [projectId, dispatch, toast, navigate, initializeDefaultDocumentStructure]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Loading your writing environment..." 
          color="primary" 
        />
      </div>
    );
  }

  return <WritingStudioLayout />;
};

export default WritingStudio;
