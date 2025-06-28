
export interface DocumentNode {
  id: string;
  title: string;
  type: 'document' | 'folder' | 'chapter' | 'scene' | 'research-note';
  status: 'not-started' | 'in-progress' | 'draft' | 'first-draft' | 'revised' | 'final' | 'completed';
  content?: string;
  synopsis?: string;
  wordCount: number;
  targetWordCount?: number;
  labels: string[];
  createdAt: Date;
  lastModified: Date;
  position: number;
  parentId?: string;
  children?: DocumentNode[];
  metadata?: {
    POV?: string;
    setting?: string;
    characters?: string[];
    notes?: string;
    [key: string]: any;
  };
}

export interface DocumentView {
  id: string;
  name: string;
  type: 'editor' | 'corkboard' | 'outline' | 'timeline' | 'research';
  activeDocumentId?: string;
  viewSettings?: Record<string, unknown>;
}

export type DocumentType = DocumentNode['type'];
export type DocumentStatus = DocumentNode['status'];
