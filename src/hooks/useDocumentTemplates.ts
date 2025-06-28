
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentNode } from '@/types/document';

interface Template {
  id: string;
  name: string;
  description: string;
  structure: DocumentNode[];
}

const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: 'novel',
    name: 'Novel',
    description: 'Standard novel structure with parts and chapters',
    structure: [
      {
        id: 'part-1',
        title: 'Part I',
        type: 'folder',
        status: 'not-started',
        wordCount: 0,
        labels: [],
        createdAt: new Date(),
        lastModified: new Date(),
        position: 0,
        children: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            type: 'chapter',
            status: 'not-started',
            wordCount: 0,
            labels: [],
            createdAt: new Date(),
            lastModified: new Date(),
            position: 0,
            parentId: 'part-1'
          }
        ]
      }
    ]
  }
];

export const useDocumentTemplates = () => {
  const { dispatch } = useProject();

  const applyTemplate = (templateId: string) => {
    const template = BUILT_IN_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      dispatch({
        type: 'SET_DOCUMENT_TREE',
        payload: template.structure
      });
    }
  };

  return {
    templates: BUILT_IN_TEMPLATES,
    applyTemplate
  };
};
