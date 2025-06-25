export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  lastModified: Date;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  wordCountTarget?: number;
  status: 'draft' | 'revision' | 'editing' | 'complete';
  settings?: object; // Project-specific settings (JSON from DB)
}

export interface DocumentNode {
  id: string;
  title: string;
  type: 'folder' | 'document' | 'chapter' | 'scene' | 'character-sheet' | 'research-note' | 'timeline-event';
  parentId?: string;
  children?: DocumentNode[];
  content?: string;
  synopsis?: string;
  status: 'not-started' | 'draft' | 'first-draft' | 'revised' | 'final';
  wordCount: number;
  targetWordCount?: number;
  labels: string[];
  createdAt: Date;
  lastModified: Date;
  position: number;
  metadata?: {
    POV?: string;
    setting?: string;
    characters?: string[];
    keywords?: string[];
    notes?: string;
    eventDate?: Date;
    importance?: 'low' | 'medium' | 'high';
  };
}

export interface DocumentView {
  id: string;
  name: string;
  type: 'editor' | 'corkboard' | 'outline' | 'timeline' | 'research';
  activeDocumentId?: string;
  viewSettings?: Record<string, any>;
}
