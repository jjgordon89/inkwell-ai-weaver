/**
 * Unified Template Type System
 * 
 * This file provides a unified approach to project templates that combines:
 * - Backend database fields (from Rust/Tauri)
 * - App logic fields (document structure)
 * - UI display fields (icons, features, etc.)
 */

import { DocumentNode } from './document';

/**
 * Base template structure that all implementations should support
 */
export interface ProjectTemplateBase {
  id: string;
  name: string;
  description: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
}

/**
 * Database/Backend fields (from Rust backend)
 */
export interface ProjectTemplateBackend extends ProjectTemplateBase {
  author_name?: string;
  author_email?: string;
  preview_image?: string;
  category?: string;
  difficulty?: string;
  estimated_time?: string;
  created_at: string;
  last_modified: string;
}

/**
 * UI/Display fields for frontend components
 */
export interface ProjectTemplateUI extends ProjectTemplateBase {
  icon: string;
  features: string[];
  defaultSettings: {
    wordCountTarget?: number;
    chapterCount?: number;
    scenesPerChapter?: number;
    actCount?: number;
    poemCount?: number;
    researchSections?: number;
    genre?: string;
    writingStyle?: string;
  };
  sampleContent?: {
    chapters?: Array<{
      title: string;
      content: string;
    }>;
    characters?: Array<{
      name: string;
      description: string;
    }>;
  };
}

/**
 * App Logic fields for project creation
 */
export interface ProjectTemplateLogic extends ProjectTemplateBase {
  initialDocumentTree: DocumentNode[];
  metadata?: {
    authorName?: string;
    authorEmail?: string;
    tags?: string[];
    previewImage?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: string;
  };
}

/**
 * Unified template that combines all concerns
 * This is what UI components should use
 */
export interface UnifiedProjectTemplate extends ProjectTemplateBase {
  // Backend fields
  author_name?: string;
  author_email?: string;
  preview_image?: string;
  category?: string;
  difficulty?: string;
  estimated_time?: string;
  created_at?: string;
  last_modified?: string;
  
  // UI fields
  icon: string;
  features: string[];
  defaultSettings: {
    wordCountTarget?: number;
    chapterCount?: number;
    scenesPerChapter?: number;
    actCount?: number;
    poemCount?: number;
    researchSections?: number;
    genre?: string;
    writingStyle?: string;
  };
  sampleContent?: {
    chapters?: Array<{
      title: string;
      content: string;
    }>;
    characters?: Array<{
      name: string;
      description: string;
    }>;
  };
  
  // Logic fields
  initialDocumentTree?: DocumentNode[];
  metadata?: {
    authorName?: string;
    authorEmail?: string;
    tags?: string[];
    previewImage?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: string;
  };
}

/**
 * Type for creating new templates (excludes generated fields)
 */
export type CreateTemplateInput = Omit<UnifiedProjectTemplate, 'id' | 'created_at' | 'last_modified'>;

/**
 * Type for updating existing templates (all fields optional except id)
 */
export interface UpdateTemplateInput extends Partial<UnifiedProjectTemplate> {
  id: string;
}

/**
 * Template adapter functions for converting between formats
 */
export class TemplateAdapters {
  /**
   * Convert backend template to unified format
   */
  static fromBackend(backend: ProjectTemplateBackend, uiDefaults?: Partial<ProjectTemplateUI>): UnifiedProjectTemplate {
    const structureDefaults = this.getStructureDefaults(backend.structure);
    
    return {
      id: backend.id,
      name: backend.name,
      description: backend.description,
      structure: backend.structure,
      author_name: backend.author_name,
      author_email: backend.author_email,
      preview_image: backend.preview_image,
      category: backend.category,
      difficulty: backend.difficulty,
      estimated_time: backend.estimated_time,
      created_at: backend.created_at,
      last_modified: backend.last_modified,
      
      // Apply UI defaults or fallbacks
      icon: uiDefaults?.icon || structureDefaults.icon,
      features: uiDefaults?.features || structureDefaults.features,
      defaultSettings: {
        ...structureDefaults.defaultSettings,
        ...uiDefaults?.defaultSettings,
      },
      sampleContent: uiDefaults?.sampleContent,
      
      // Metadata mapping
      metadata: {
        authorName: backend.author_name,
        authorEmail: backend.author_email,
        previewImage: backend.preview_image,
        category: backend.category,
        difficulty: backend.difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimatedTime: backend.estimated_time,
      },
    };
  }

  /**
   * Convert UI template to backend format
   */
  static toBackend(unified: UnifiedProjectTemplate): ProjectTemplateBackend {
    return {
      id: unified.id,
      name: unified.name,
      description: unified.description,
      structure: unified.structure,
      author_name: unified.author_name || unified.metadata?.authorName,
      author_email: unified.author_email || unified.metadata?.authorEmail,
      preview_image: unified.preview_image || unified.metadata?.previewImage,
      category: unified.category || unified.metadata?.category,
      difficulty: unified.difficulty || unified.metadata?.difficulty,
      estimated_time: unified.estimated_time || unified.metadata?.estimatedTime,
      created_at: unified.created_at || new Date().toISOString(),
      last_modified: unified.last_modified || new Date().toISOString(),
    };
  }

  /**
   * Convert unified to UI-only format (for compatibility)
   */
  static toUI(unified: UnifiedProjectTemplate): ProjectTemplateUI {
    return {
      id: unified.id,
      name: unified.name,
      description: unified.description,
      structure: unified.structure,
      icon: unified.icon,
      features: unified.features,
      defaultSettings: unified.defaultSettings,
      sampleContent: unified.sampleContent,
    };
  }

  /**
   * Convert unified to logic format (for project creation)
   */
  static toLogic(unified: UnifiedProjectTemplate): ProjectTemplateLogic {
    return {
      id: unified.id,
      name: unified.name,
      description: unified.description,
      structure: unified.structure,
      initialDocumentTree: unified.initialDocumentTree || this.getDefaultDocumentTree(unified.structure),
      metadata: unified.metadata,
    };
  }

  /**
   * Get default UI settings based on structure type
   */
  private static getStructureDefaults(structure: string): Pick<ProjectTemplateUI, 'icon' | 'features' | 'defaultSettings'> {
    switch (structure) {
      case 'novel':
        return {
          icon: '📖',
          features: ['Chapter organization', 'Character tracking', 'Plot development'],
          defaultSettings: {
            wordCountTarget: 80000,
            chapterCount: 20,
            genre: 'Fiction',
          },
        };
      case 'screenplay':
        return {
          icon: '🎬',
          features: ['Scene structure', 'Character development', 'Dialogue formatting'],
          defaultSettings: {
            wordCountTarget: 25000,
            genre: 'Drama',
          },
        };
      case 'research':
        return {
          icon: '🔬',
          features: ['Citation management', 'Data organization', 'Bibliography'],
          defaultSettings: {
            wordCountTarget: 15000,
          },
        };
      case 'poetry':
        return {
          icon: '✨',
          features: ['Verse structure', 'Rhythm analysis', 'Collection organization'],
          defaultSettings: {
            wordCountTarget: 5000,
          },
        };
      default:
        return {
          icon: '📝',
          features: ['Basic structure'],
          defaultSettings: {
            wordCountTarget: 10000,
          },
        };
    }
  }

  /**
   * Get default document tree based on structure type
   */
  private static getDefaultDocumentTree(structure: string): DocumentNode[] {
    // This would contain the default document structure for each type
    // For now, return empty array - this should be implemented based on your document structure needs
    return [];
  }
}

/**
 * Type guards for template validation
 */
export class TemplateTypeGuards {
  static isBackendTemplate(obj: unknown): obj is ProjectTemplateBackend {
    return obj !== null && 
           typeof obj === 'object' &&
           'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' &&
           'name' in obj && typeof (obj as Record<string, unknown>).name === 'string' &&
           'created_at' in obj && typeof (obj as Record<string, unknown>).created_at === 'string' &&
           'last_modified' in obj && typeof (obj as Record<string, unknown>).last_modified === 'string';
  }

  static isUITemplate(obj: unknown): obj is ProjectTemplateUI {
    return obj !== null &&
           typeof obj === 'object' &&
           'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' &&
           'name' in obj && typeof (obj as Record<string, unknown>).name === 'string' &&
           'icon' in obj && typeof (obj as Record<string, unknown>).icon === 'string' &&
           'features' in obj && Array.isArray((obj as Record<string, unknown>).features) &&
           'defaultSettings' in obj && typeof (obj as Record<string, unknown>).defaultSettings === 'object';
  }

  static isUnifiedTemplate(obj: unknown): obj is UnifiedProjectTemplate {
    return obj !== null &&
           typeof obj === 'object' &&
           'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' &&
           'name' in obj && typeof (obj as Record<string, unknown>).name === 'string' &&
           'icon' in obj && typeof (obj as Record<string, unknown>).icon === 'string' &&
           'features' in obj && Array.isArray((obj as Record<string, unknown>).features);
  }
}

// Re-export for backward compatibility
export type { UnifiedProjectTemplate as ProjectTemplate };
