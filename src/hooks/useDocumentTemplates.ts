
import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  structure?: {
    chapters?: string[];
    scenes?: string[];
  };
}

const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'novel',
    name: 'Novel',
    description: 'Standard novel structure with chapters',
    category: 'Fiction',
    content: 'Chapter 1\n\n[Your story begins here...]',
    structure: {
      chapters: ['Chapter 1', 'Chapter 2', 'Chapter 3']
    }
  },
  {
    id: 'short-story',
    name: 'Short Story',
    description: 'Single document for short fiction',
    category: 'Fiction',
    content: '[Your short story begins here...]'
  },
  {
    id: 'screenplay',
    name: 'Screenplay',
    description: 'Formatted screenplay template',
    category: 'Screenwriting',
    content: 'FADE IN:\n\nEXT. LOCATION - DAY\n\n[Scene description]'
  },
  {
    id: 'research-paper',
    name: 'Research Paper',
    description: 'Academic paper structure',
    category: 'Academic',
    content: '# Title\n\n## Abstract\n\n## Introduction\n\n## Methodology\n\n## Results\n\n## Conclusion'
  }
];

export const useDocumentTemplates = () => {
  const { dispatch } = useProject();
  const [templates] = useState(DEFAULT_TEMPLATES);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTemplates] = useState(DEFAULT_TEMPLATES);

  const applyTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      if (template.structure?.chapters) {
        // Create structured project with chapters
        template.structure.chapters.forEach((chapterTitle, index) => {
          const doc = {
            id: crypto.randomUUID(),
            title: chapterTitle,
            type: 'chapter' as const,
            status: 'not-started' as const,
            content: index === 0 ? template.content : '',
            wordCount: 0,
            labels: [],
            createdAt: new Date(),
            lastModified: new Date(),
            position: index
          };
          
          dispatch({ type: 'ADD_DOCUMENT', payload: doc });
        });
      } else {
        // Create single document
        const doc = {
          id: crypto.randomUUID(),
          title: template.name,
          type: 'document' as const,
          status: 'not-started' as const,
          content: template.content,
          wordCount: template.content.trim().split(/\s+/).filter(Boolean).length,
          labels: [],
          createdAt: new Date(),
          lastModified: new Date(),
          position: 0
        };
        
        dispatch({ type: 'ADD_DOCUMENT', payload: doc });
      }
    } finally {
      setIsLoading(false);
    }
  }, [templates, dispatch]);

  return {
    templates,
    defaultTemplates,
    isLoading,
    applyTemplate
  };
};
