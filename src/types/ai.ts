// Unified AI types for suggestions, actions, and providers

export type AISuggestionType =
  | 'improvement'
  | 'completion'
  | 'character'
  | 'plot'
  | 'continuation'
  | 'correction';

export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  text: string;
  confidence: number;
  position?: { start: number; end: number };
  original?: string;
}

export type AIProcessAction =
  | 'improve'
  | 'continue'
  | 'summarize'
  | 'expand'
  | 'shorten'
  | 'fix-grammar';

export interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
  type?: string;
  apiEndpoint?: string;
  apiKey?: string;
}

export interface AIContext {
  currentText: string;
  cursorPosition: number;
  selectedText: string;
  characters: string[];
}
