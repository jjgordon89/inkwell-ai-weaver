
export interface AIProvider {
  name: string;
  models: string[];
  requiresApiKey: boolean;
  apiEndpoint?: string;
}

export type AIAction = 'improve' | 'shorten' | 'expand' | 'fix-grammar';

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
