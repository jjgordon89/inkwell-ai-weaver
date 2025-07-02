
export interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
  apiEndpoint?: string;
  type?: 'cloud' | 'local';
  defaultPort?: number;
  description?: string;
  setupInstructions?: string;
  customEndpoint?: string; // For user-specified endpoints
}

export type AIAction = 
  // General writing actions
  | 'improve' 
  | 'shorten' 
  | 'expand' 
  | 'fix-grammar'
  | 'analyze-tone'
  | 'generate-plot'
  | 'continue-story'
  | 'writing-prompt'
  | 'context-suggestion'
  | 'analyze-writing-quality'
  | 'predict-next-words'
  
  // Academic writing actions
  | 'academic-thesis-statement'
  | 'academic-literature-review'
  | 'academic-abstract'
  | 'academic-research-question'
  | 'academic-methodology'
  
  // Memoir writing actions
  | 'memoir-reflection'
  | 'memoir-timeline'
  | 'memoir-character-sketch'
  | 'memoir-setting-description'
  | 'memoir-emotional-insight'
  
  // Nonfiction writing actions
  | 'nonfiction-outline'
  | 'nonfiction-research-summary'
  | 'nonfiction-expert-interview'
  | 'nonfiction-fact-check'
  | 'nonfiction-conclusion';

export interface AIHookReturn {
  isProcessing: boolean;
  isTestingConnection: boolean;
  selectedProvider: string;
  selectedModel: string;
  setSelectedProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  apiKeys: Record<string, string>;
  setApiKey: (providerName: string, key: string) => void;
  testConnection: (providerName: string) => Promise<boolean>;
  processText: (text: string, action: AIAction) => Promise<string>;
  generateSuggestions: (context: string) => Promise<string[]>;
  availableProviders: AIProvider[];
  getCurrentProviderInfo: () => AIProvider | undefined;
  isProviderConfigured: (providerName: string) => boolean;
  isCurrentProviderConfigured: () => boolean;
}

export interface ToneAnalysis {
  tone: string;
  confidence: number;
  suggestions: string[];
}

export interface ReadabilityScore {
  score: number;
  level: string;
  suggestions: string[];
}

export interface WritingMetrics {
  readability: ReadabilityScore;
  sentenceVariety: number;
  vocabularyRichness: number;
  pacing: string;
  engagement: number;
}

export interface PlotElement {
  type: 'conflict' | 'twist' | 'resolution' | 'character-development';
  description: string;
  placement: 'beginning' | 'middle' | 'end';
}

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
