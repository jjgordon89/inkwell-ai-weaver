
import { useCallback, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  format: 'docx' | 'pdf' | 'txt' | 'json';
}

const DEFAULT_EXPORT_PRESETS: ExportPreset[] = [
  { id: 'manuscript', name: 'Manuscript', description: 'Standard manuscript format', format: 'docx' },
  { id: 'pdf', name: 'PDF Document', description: 'Formatted PDF', format: 'pdf' },
  { id: 'plain-text', name: 'Plain Text', description: 'Simple text file', format: 'txt' },
  { id: 'backup', name: 'Project Backup', description: 'Complete project data', format: 'json' }
];

export const useImportExport = () => {
  const { state } = useProject();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportPresets] = useState(DEFAULT_EXPORT_PRESETS);

  const exportProject = useCallback(async (format: string = 'json', options: any = {}) => {
    setIsExporting(true);
    try {
      const projectData = {
        project: state.currentProject,
        documents: state.flatDocuments,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentProject?.name || 'project'}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [state]);

  const importProject = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const projectData = JSON.parse(text);
      
      // Here you would dispatch actions to load the project data
      console.log('Import project data:', projectData);
      
      // For now, just log - in real implementation would restore project state
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const importDocument = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      
      // Create new document from imported content
      const newDoc = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: 'document' as const,
        status: 'not-started' as const,
        content: text,
        wordCount: text.trim().split(/\s+/).filter(Boolean).length,
        labels: [],
        createdAt: new Date(),
        lastModified: new Date(),
        position: 0
      };

      return newDoc;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    exportProject,
    importProject,
    importDocument,
    exportPresets,
    isExporting,
    isImporting
  };
};
