import { generateDocumentStructure } from '@/utils/documentStructureGenerator';
import { useCallback } from 'react';
import { UnifiedProjectTemplate } from '@/types/unified-templates';
import { DocumentNode } from '@/types/document';

/**
 * Hook to generate document structure for a new project
 */
export function useDocumentStructureGenerator() {
  /**
   * Generate document structure based on project type and template options
   */
  const generateDocuments = useCallback((
    structure: 'novel' | 'screenplay' | 'research' | 'poetry',
    options?: {
      template?: UnifiedProjectTemplate | null;
      chapterCount?: number;
      scenesPerChapter?: number;
      actCount?: number;
      poemCount?: number;
      researchSections?: number;
    }
  ): DocumentNode[] => {
    const templateType = structure;
    const templateOptions = {
      chapterCount: options?.chapterCount ?? (options?.template?.defaultSettings?.chapterCount ?? 10),
      scenesPerChapter: options?.scenesPerChapter ?? (options?.template?.defaultSettings?.scenesPerChapter ?? 3),
      actCount: options?.actCount ?? (options?.template?.defaultSettings?.actCount ?? 3),
      poemCount: options?.poemCount ?? (options?.template?.defaultSettings?.poemCount ?? 10),
      researchSections: options?.researchSections ?? (options?.template?.defaultSettings?.researchSections ?? 5)
    };

    // Generate document structure using the utility
    return generateDocumentStructure(templateType, templateOptions);
  }, []);

  return {
    generateDocuments
  };
}
