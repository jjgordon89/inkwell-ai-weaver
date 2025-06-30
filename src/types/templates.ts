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
  settings: Record<string, unknown>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  icon: string;
  features: string[];
  defaultSettings: {
    wordCountTarget?: number;
    chapterCount?: number;
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

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'novel-blank',
    name: 'Blank Novel',
    description: 'Start with a clean slate for your novel',
    structure: 'novel',
    icon: '📖',
    features: ['Chapter organization', 'Character tracking', 'Plot development'],
    defaultSettings: {
      wordCountTarget: 80000,
      chapterCount: 20,
      genre: 'Fiction',
    },
  },
  {
    id: 'novel-mystery',
    name: 'Mystery Novel',
    description: 'Template optimized for mystery and thriller writing',
    structure: 'novel',
    icon: '🔍',
    features: ['Clue tracking', 'Character secrets', 'Timeline management'],
    defaultSettings: {
      wordCountTarget: 75000,
      chapterCount: 18,
      genre: 'Mystery',
    },
    sampleContent: {
      chapters: [
        {
          title: 'The Discovery',
          content: 'The first chapter often introduces the mystery or crime...',
        },
      ],
    },
  },
  {
    id: 'novel-romance',
    name: 'Romance Novel',
    description: 'Perfect for crafting engaging romantic stories',
    structure: 'novel',
    icon: '💕',
    features: ['Relationship tracking', 'Emotional arcs', 'Character chemistry'],
    defaultSettings: {
      wordCountTarget: 70000,
      chapterCount: 16,
      genre: 'Romance',
    },
  },
  {
    id: 'screenplay-feature',
    name: 'Feature Film Screenplay',
    description: 'Standard three-act structure for feature films',
    structure: 'screenplay',
    icon: '🎬',
    features: ['Scene breakdown', 'Character arcs', 'Act structure'],
    defaultSettings: {
      wordCountTarget: 25000,
      genre: 'Drama',
    },
  },
  {
    id: 'screenplay-short',
    name: 'Short Film Screenplay',
    description: 'Concise format for short film projects',
    structure: 'screenplay',
    icon: '🎭',
    features: ['Tight pacing', 'Character focus', 'Visual storytelling'],
    defaultSettings: {
      wordCountTarget: 5000,
      genre: 'Short Film',
    },
  },
  {
    id: 'research-academic',
    name: 'Academic Research',
    description: 'Structured template for academic papers and research',
    structure: 'research',
    icon: '🎓',
    features: ['Citation management', 'Research tracking', 'Bibliography'],
    defaultSettings: {
      wordCountTarget: 10000,
    },
  },
  {
    id: 'research-journalism',
    name: 'Investigative Journalism',
    description: 'Template for investigative reporting and journalism',
    structure: 'research',
    icon: '📰',
    features: ['Source tracking', 'Fact verification', 'Interview notes'],
    defaultSettings: {
      wordCountTarget: 5000,
    },
  },
  {
    id: 'poetry-collection',
    name: 'Poetry Collection',
    description: 'Organize and develop a collection of poems',
    structure: 'poetry',
    icon: '✨',
    features: ['Poem organization', 'Theme tracking', 'Form analysis'],
    defaultSettings: {
      wordCountTarget: 2000,
    },
  },
];
