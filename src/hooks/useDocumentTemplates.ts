
import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from "@/hooks/use-toast";
import type { DocumentTemplate, TemplateStructure } from '@/types/templates';
import type { DocumentNode } from '@/types/document';

export const useDocumentTemplates = () => {
  const { dispatch } = useProject();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const defaultTemplates: DocumentTemplate[] = [
    {
      id: 'novel-template',
      name: 'Novel Template',
      description: 'Standard novel structure with chapters and scenes',
      category: 'novel',
      icon: 'BookOpen',
      structure: [
        {
          id: 'manuscript',
          title: 'Manuscript',
          type: 'folder',
          position: 0,
          children: [
            {
              id: 'chapter-1',
              title: 'Chapter 1: The Beginning',
              type: 'chapter',
              position: 0,
              content: '',
              synopsis: 'Opening chapter that introduces the main character and setting.'
            },
            {
              id: 'chapter-2',
              title: 'Chapter 2: Rising Action',
              type: 'chapter',
              position: 1,
              content: '',
              synopsis: 'The main conflict begins to develop.'
            }
          ]
        },
        {
          id: 'characters',
          title: 'Characters',
          type: 'folder',
          position: 1,
          children: [
            {
              id: 'protagonist',
              title: 'Protagonist Profile',
              type: 'character-sheet',
              position: 0,
              content: 'Name:\nAge:\nBackground:\nMotivation:\nConflict:'
            }
          ]
        },
        {
          id: 'research',
          title: 'Research & Notes',
          type: 'folder',
          position: 2,
          children: [
            {
              id: 'world-building',
              title: 'World Building Notes',
              type: 'research-note',
              position: 0,
              content: 'Setting:\nTime Period:\nSociety:\nRules:'
            }
          ]
        }
      ],
      metadata: {
        wordCountTarget: 80000,
        tags: ['fiction', 'novel', 'template']
      }
    },
    {
      id: 'screenplay-template',
      name: 'Screenplay Template',
      description: 'Three-act screenplay structure',
      category: 'screenplay',
      icon: 'Film',
      structure: [
        {
          id: 'screenplay',
          title: 'Screenplay',
          type: 'folder',
          position: 0,
          children: [
            {
              id: 'act-1',
              title: 'Act I - Setup',
              type: 'folder',
              position: 0,
              children: [
                {
                  id: 'scene-1',
                  title: 'Scene 1 - Opening',
                  type: 'scene',
                  position: 0,
                  content: 'FADE IN:\n\nEXT. LOCATION - TIME\n\n'
                }
              ]
            },
            {
              id: 'act-2',
              title: 'Act II - Confrontation',
              type: 'folder',
              position: 1
            },
            {
              id: 'act-3',
              title: 'Act III - Resolution',
              type: 'folder',
              position: 2
            }
          ]
        }
      ],
      metadata: {
        wordCountTarget: 25000,
        tags: ['screenplay', 'script', 'template']
      }
    },
    {
      id: 'research-template',
      name: 'Research Project',
      description: 'Academic research and thesis structure',
      category: 'research',
      icon: 'Search',
      structure: [
        {
          id: 'research-project',
          title: 'Research Project',
          type: 'folder',
          position: 0,
          children: [
            {
              id: 'abstract',
              title: 'Abstract',
              type: 'document',
              position: 0,
              content: 'Abstract:\n\nKeywords:'
            },
            {
              id: 'introduction',
              title: 'Introduction',
              type: 'document',
              position: 1
            },
            {
              id: 'methodology',
              title: 'Methodology',
              type: 'document',
              position: 2
            },
            {
              id: 'results',
              title: 'Results',
              type: 'document',
              position: 3
            },
            {
              id: 'conclusion',
              title: 'Conclusion',
              type: 'document',
              position: 4
            }
          ]
        },
        {
          id: 'sources',
          title: 'Sources & References',
          type: 'folder',
          position: 1
        }
      ],
      metadata: {
        wordCountTarget: 15000,
        tags: ['research', 'academic', 'thesis']
      }
    }
  ];

  const convertTemplateToDocuments = useCallback((template: DocumentTemplate): DocumentNode[] => {
    const convertStructure = (structure: TemplateStructure, parentId?: string): DocumentNode => {
      const doc: DocumentNode = {
        id: crypto.randomUUID(),
        title: structure.title,
        type: structure.type,
        parentId,
        status: 'not-started',
        wordCount: structure.content ? structure.content.split(/\s+/).filter(w => w.length > 0).length : 0,
        labels: [],
        createdAt: new Date(),
        lastModified: new Date(),
        position: structure.position,
        content: structure.content,
        synopsis: structure.synopsis
      };

      if (structure.children && structure.children.length > 0) {
        doc.children = structure.children.map(child => convertStructure(child, doc.id));
      }

      return doc;
    };

    return template.structure.map(struct => convertStructure(struct));
  }, []);

  const applyTemplate = useCallback(async (template: DocumentTemplate) => {
    setIsLoading(true);
    try {
      const documents = convertTemplateToDocuments(template);
      dispatch({ type: 'SET_DOCUMENT_TREE', payload: documents });
      
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied to your project.`,
      });
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast({
        title: "Template Error",
        description: "Failed to apply template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [convertTemplateToDocuments, dispatch, toast]);

  const createCustomTemplate = useCallback((name: string, description: string, category: DocumentTemplate['category'], structure: DocumentNode[]): DocumentTemplate => {
    const convertToTemplateStructure = (node: DocumentNode): TemplateStructure => ({
      id: node.id,
      title: node.title,
      type: node.type === 'timeline-event' ? 'research-note' : node.type, // Convert timeline-event to research-note
      content: node.content,
      synopsis: node.synopsis,
      position: node.position,
      children: node.children?.map(convertToTemplateStructure)
    });

    return {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      icon: 'FileText',
      structure: structure.map(convertToTemplateStructure),
      metadata: {
        author: 'User',
        version: '1.0.0',
        tags: ['custom']
      }
    };
  }, []);

  return {
    defaultTemplates,
    isLoading,
    applyTemplate,
    createCustomTemplate,
    convertTemplateToDocuments
  };
};
