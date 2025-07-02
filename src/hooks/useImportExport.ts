import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from "@/hooks/use-toast";
import type { ImportOptions, ExportPreset } from '@/types/templates';
import type { DocumentNode } from '@/types/document';

export const useImportExport = () => {
  const { state, dispatch } = useProject();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export progress tracking
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);

  const exportPresets: ExportPreset[] = [
    {
      id: 'manuscript-pdf',
      name: 'Manuscript PDF',
      description: 'Standard manuscript format for submissions',
      format: 'pdf',
      settings: {
        fontSize: 12,
        fontFamily: 'Times New Roman',
        lineHeight: 2.0,
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        pageNumbers: true,
        titlePage: true
      }
    },
    {
      id: 'ebook-epub',
      name: 'E-book EPUB',
      description: 'E-reader compatible format',
      format: 'epub',
      settings: {
        includeMetadata: true,
        tableOfContents: true,
        chapterBreaks: true
      }
    },
    {
      id: 'print-pdf',
      name: 'Print-Ready PDF',
      description: 'Professional print layout',
      format: 'pdf',
      settings: {
        pageSize: '6x9',
        margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
        gutterSize: 0.25,
        dropCaps: true,
        chapterStartRightPage: true
      }
    }
  ];

  const importDocument = useCallback(async (file: File, options: ImportOptions) => {
    setIsImporting(true);
    setImportProgress(10);
    try {
      const text = await file.text();
      
      // Simple text processing - in a real app, you'd use proper parsers
      let content = text;
      let documents: DocumentNode[] = [];

      if (options.splitChapters && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
        // Split by chapter markers
        const chapters = content.split(/^(Chapter \d+|CHAPTER \d+)/gm);
        
        for (let i = 1; i < chapters.length; i += 2) {
          const chapterTitle = chapters[i].trim();
          const chapterContent = chapters[i + 1]?.trim() || '';
          
          documents.push({
            id: crypto.randomUUID(),
            title: chapterTitle,
            type: 'chapter',
            status: 'draft',
            wordCount: chapterContent.split(/\s+/).filter(w => w.length > 0).length,
            labels: ['imported'],
            createdAt: new Date(),
            lastModified: new Date(),
            position: (i - 1) / 2,
            content: chapterContent
          });
        }
      } else {
        // Import as single document
        documents.push({
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          type: 'document',
          status: 'draft',
          wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
          labels: ['imported'],
          createdAt: new Date(),
          lastModified: new Date(),
          position: 0,
          content
        });
      }

      // Add to document tree
      const currentTree = state.documentTree;
      dispatch({ type: 'SET_DOCUMENT_TREE', payload: [...currentTree, ...documents] });

      setImportProgress(100);
      
      toast({
        title: "Import Successful",
        description: `Imported ${documents.length} document(s) from ${file.name}`,
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import document. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
      }, 500);
    }
  }, [state.documentTree, dispatch, toast]);

  const exportProject = useCallback(async (preset: ExportPreset, documentIds?: string[]) => {
    setIsExporting(true);
    setExportProgress(10);
    try {
      // Get documents to export
      const docsToExport = documentIds 
        ? state.flatDocuments.filter(doc => documentIds.includes(doc.id))
        : state.flatDocuments.filter(doc => doc.type !== 'folder');

      if (docsToExport.length === 0) {
        toast({
          title: "No Content",
          description: "No documents selected for export.",
          variant: "destructive"
        });
        return;
      }

      // Combine content
      let exportContent = '';
      
      docsToExport
        .sort((a, b) => a.position - b.position)
        .forEach(doc => {
          if (doc.content) {
            exportContent += `\n\n# ${doc.title}\n\n${doc.content}`;
          }
        });

      // Create blob and download
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${Date.now()}.${preset.format === 'epub' ? 'txt' : preset.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      
      toast({
        title: "Export Successful",
        description: `Project exported as ${preset.name}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  }, [state.flatDocuments, toast]);

  const exportDocument = useCallback(async (documentId: string, format: string) => {
    const doc = state.flatDocuments.find(doc => doc.id === documentId);
    if (!doc || !doc.content) {
      toast({
        title: "No Content",
        description: "Document has no content to export.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `"${doc.title}" exported successfully`,
    });
  }, [state.flatDocuments, toast]);

  // Export all projects functionality
  const exportAllProjects = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      // Get all projects
      const allProjects = state.projects;
      
      setExportProgress(30);
      
      // Process projects data with metadata
      const exportData = {
        metadata: {
          appVersion: '1.0.0',
          exportDate: new Date().toISOString(),
          projectCount: allProjects.length
        },
        projects: allProjects
      };
      
      setExportProgress(50);
      
      // Convert to JSON
      const projectsJson = JSON.stringify(exportData, null, 2);
      
      setExportProgress(70);
      
      // Create and download file
      const blob = new Blob([projectsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inkwell-projects-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportProgress(100);
      
      toast({
        title: "Export Successful",
        description: `Exported ${allProjects.length} projects`,
      });
    } catch (error) {
      console.error('Export all projects failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export all projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  }, [state.projects, toast]);

  // Import project from file
  const importProject = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportProgress(10);
    
    try {
      // Read file
      const fileContent = await file.text();
      
      setImportProgress(30);
      
      // Parse JSON
      const projectData = JSON.parse(fileContent);
      
      setImportProgress(50);
      
      // Validate project structure
      if (!projectData.name || !projectData.structure) {
        throw new Error("Invalid project file format");
      }
      
      setImportProgress(70);
      
      // Process documents if any
      const documents = projectData.documents || [];
      
      // Create project
      const projectId = crypto.randomUUID();
      const newProject = {
        id: projectId,
        name: projectData.name,
        description: projectData.description || '',
        structure: projectData.structure,
        createdAt: new Date(),
        lastModified: new Date(),
        status: 'active',
        settings: projectData.settings || {}
      };
      
      // Add project to state
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      
      // Add documents if any
      if (documents.length > 0) {
        dispatch({ 
          type: 'SET_DOCUMENT_TREE', 
          payload: documents.map((doc: DocumentNode) => ({
            ...doc,
            projectId
          })) 
        });
      }
      
      setImportProgress(100);
      
      toast({
        title: "Import Successful",
        description: `Imported project "${projectData.name}" with ${documents.length} document(s)`,
      });
      
      return {
        projectId,
        projectName: projectData.name
      };
    } catch (error) {
      console.error('Import project failed:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import project. Please check the file format.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
      }, 500);
    }
  }, [dispatch, toast]);

  return {
    exportPresets,
    isImporting,
    isExporting,
    importDocument,
    exportProject,
    exportDocument,
    exportAllProjects,
    importProject,
    exportProgress,
    importProgress
  };
};
