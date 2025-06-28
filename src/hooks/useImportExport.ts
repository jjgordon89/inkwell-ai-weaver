
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentNode } from '@/types/document';

export const useImportExport = () => {
  const { state, dispatch } = useProject();

  const exportProject = () => {
    const projectData = {
      project: state.currentProject,
      documents: state.flatDocuments,
      documentTree: state.documentTree
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.currentProject?.title || 'project'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importProject = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.documentTree) {
            dispatch({
              type: 'SET_DOCUMENT_TREE',
              payload: data.documentTree as DocumentNode[]
            });
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return {
    exportProject,
    importProject
  };
};
