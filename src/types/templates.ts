
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'business';
  icon: string;
  structure: TemplateStructure[];
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
    wordCountTarget?: number;
  };
}

export interface TemplateStructure {
  id: string;
  title: string;
  type: 'folder' | 'document' | 'chapter' | 'scene' | 'character-sheet' | 'research-note';
  content?: string;
  synopsis?: string;
  children?: TemplateStructure[];
  position: number;
}

export interface ImportOptions {
  format: 'docx' | 'txt' | 'md' | 'pdf' | 'rtf';
  preserveFormatting: boolean;
  splitChapters: boolean;
  createOutline: boolean;
}

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  format: string;
  settings: Record<string, any>;
}
