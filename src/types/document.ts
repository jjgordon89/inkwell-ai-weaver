
export interface DocumentNode {
  id: string;
  title: string;
  type: 'document' | 'folder' | 'chapter' | 'scene';
  status: 'not-started' | 'in-progress' | 'draft' | 'completed';
  content?: string;
  synopsis?: string;
  wordCount: number;
  labels: string[];
  createdAt: Date;
  lastModified: Date;
  position: number;
  parentId?: string;
  children?: DocumentNode[];
}

export type DocumentType = DocumentNode['type'];
export type DocumentStatus = DocumentNode['status'];
