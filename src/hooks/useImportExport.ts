
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
      setIsImporting(false);
    }
  }, [state.documentTree, dispatch, toast]);

  const exportProject = useCallback(async (preset: ExportPreset, documentIds?: string[]) => {
    setIsExporting(true);
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
      setIsExporting(false);
    }
  }, [state.flatDocuments, toast]);

  const exportDocument = useCallback(async (documentId: string, format: string) => {
    const document = state.flatDocuments.find(doc => doc.id === documentId);
    if (!document || !document.content) {
      toast({
        title: "No Content",
        description: "Document has no content to export.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `"${document.title}" exported successfully`,
    });
  }, [state.flatDocuments, toast]);

  return {
    exportPresets,
    isImporting,
    isExporting,
    importDocument,
    exportProject,
    exportDocument
  };
};
