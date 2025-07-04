
export interface OutlineItem {
  id: string;
  type: 'chapter' | 'scene';
  title: string;
  description?: string;
  summary?: string;
  wordCount?: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'needs-revision';
  color?: string;
  position: number;
  parentId?: string; // for scenes under chapters
  children?: OutlineItem[]; // for chapters containing scenes
  notes?: string;
  tags?: string[];
  estimatedWordCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  wordCount: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'needs-revision';
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutlineStructure {
  items: OutlineItem[];
  totalWordCount: number;
  completedItems: number;
  totalItems: number;
}

export type ViewMode = 'hierarchy' | 'corkboard' | 'timeline';
export type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'completed' | 'needs-revision';
