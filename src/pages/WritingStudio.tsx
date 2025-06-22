
import React, { useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import WritingStudioLayout from '@/components/layout/WritingStudioLayout';
import type { DocumentNode } from '@/types/document';

const WritingStudio = () => {
  const { state, dispatch } = useProject();

  // Initialize with sample document structure - Manuscript folder is permanent
  useEffect(() => {
    // Only initialize if no documents exist
    if (state.documentTree.length === 0) {
      const sampleDocuments: DocumentNode[] = [
        {
          id: 'manuscript-root',
          title: 'Manuscript',
          type: 'folder',
          status: 'draft',
          wordCount: 0,
          labels: ['permanent'],
          createdAt: new Date(),
          lastModified: new Date(),
          position: 0,
          metadata: {
            importance: 'high' as const,
            notes: 'This is the main manuscript folder and cannot be deleted.'
          },
          children: [
            {
              id: '2',
              title: 'Chapter 1: The Beginning',
              type: 'chapter',
              parentId: 'manuscript-root',
              status: 'first-draft',
              wordCount: 2543,
              labels: ['opening'],
              createdAt: new Date(),
              lastModified: new Date(),
              position: 0,
              content: 'It was the best of times, it was the worst of times...',
              synopsis: 'Opening chapter that introduces the main character and setting.',
              metadata: {
                POV: 'Third Person',
                setting: 'Victorian London',
                characters: ['Elizabeth', 'Mr. Darcy'],
                keywords: ['introduction', 'setting']
              }
            },
            {
              id: '3',
              title: 'Chapter 2: The Plot Thickens',
              type: 'chapter',
              parentId: 'manuscript-root',
              status: 'draft',
              wordCount: 1897,
              labels: ['conflict'],
              createdAt: new Date(),
              lastModified: new Date(),
              position: 1,
              synopsis: 'The main conflict is introduced.',
              metadata: {
                POV: 'Third Person',
                setting: 'Victorian London',
                characters: ['Elizabeth', 'Wickham'],
                keywords: ['conflict', 'tension']
              }
            }
          ]
        },
        {
          id: '4',
          title: 'Research',
          type: 'folder',
          status: 'not-started',
          wordCount: 0,
          labels: [],
          createdAt: new Date(),
          lastModified: new Date(),
          position: 1,
          children: [
            {
              id: '5',
              title: 'Victorian Era Notes',
              type: 'research-note',
              parentId: '4',
              status: 'draft',
              wordCount: 456,
              labels: ['historical', 'setting'],
              createdAt: new Date(),
              lastModified: new Date(),
              position: 0,
              content: 'Research notes about Victorian era customs, fashion, and society...'
            }
          ]
        }
      ];

      dispatch({ type: 'SET_DOCUMENT_TREE', payload: sampleDocuments });
    } else {
      // Ensure Manuscript folder exists if documents are already present
      const hasManuscriptFolder = state.documentTree.some(doc => 
        doc.id === 'manuscript-root' || (doc.title === 'Manuscript' && doc.type === 'folder')
      );
      
      if (!hasManuscriptFolder) {
        const manuscriptFolder: DocumentNode = {
          id: 'manuscript-root',
          title: 'Manuscript',
          type: 'folder',
          status: 'draft',
          wordCount: 0,
          labels: ['permanent'],
          createdAt: new Date(),
          lastModified: new Date(),
          position: 0,
          metadata: {
            importance: 'high' as const,
            notes: 'This is the main manuscript folder and cannot be deleted.'
          }
        };
        
        dispatch({ type: 'ADD_DOCUMENT', payload: manuscriptFolder });
      }
    }
  }, [dispatch, state.documentTree.length]);

  return <WritingStudioLayout />;
};

export default WritingStudio;
