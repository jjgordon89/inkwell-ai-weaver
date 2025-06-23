
export interface TextImprovement {
  text: string;
  confidence: number;
  reason: string;
}

export interface AISuggestion {
  id: string;
  text: string;
  original?: string;
  confidence: number;
  type: 'improvement' | 'character' | 'plot' | 'completion';
}

export interface AIContext {
  currentText: string;
  cursorPosition: number;
  selectedText: string;
  characters: string[];
}

export interface VersionChange {
  type: 'addition' | 'deletion' | 'modification';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface VersionAnalysis {
  improvements: number;
  changes: VersionChange[];
}
