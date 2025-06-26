
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface AIState {
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
  isProcessing: boolean;
  isTestingConnection: boolean;
  error: string | null;
  lastOperation?: string;
  resultsCache: Map<string, { result: string; timestamp: number }>;
  settings: {
    cacheEnabled: boolean;
    cacheExpiry: number;
    cacheExpiryMs: number;
    maxTokens: number;
    temperature: number;
  };
}

export type AIContextAction =
  | { type: 'SET_PROVIDER'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_API_KEY'; payload: { provider: string; key: string } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_TESTING_CONNECTION'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AIState['settings']> }
  | { type: 'CACHE_RESULT'; payload: { key: string; result: string } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'LOAD_INITIAL_STATE'; payload: any };

const initialState: AIState = {
  selectedProvider: 'OpenAI',
  selectedModel: 'gpt-4',
  apiKeys: {},
  isProcessing: false,
  isTestingConnection: false,
  error: null,
  lastOperation: undefined,
  resultsCache: new Map(),
  settings: {
    cacheEnabled: true,
    cacheExpiry: 3600000, // 1 hour
    cacheExpiryMs: 3600000,
    maxTokens: 2048,
    temperature: 0.7
  }
};

const aiReducer = (state: AIState, action: AIContextAction): AIState => {
  switch (action.type) {
    case 'SET_PROVIDER':
      return { ...state, selectedProvider: action.payload };
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    case 'SET_API_KEY':
      return {
        ...state,
        apiKeys: {
          ...state.apiKeys,
          [action.payload.provider]: action.payload.key
        }
      };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_TESTING_CONNECTION':
      return { ...state, isTestingConnection: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    case 'CACHE_RESULT':
      const newCache = new Map(state.resultsCache);
      newCache.set(action.payload.key, {
        result: action.payload.result,
        timestamp: Date.now()
      });
      return { ...state, resultsCache: newCache };
    case 'CLEAR_CACHE':
      return { ...state, resultsCache: new Map() };
    case 'LOAD_INITIAL_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface AIContextType {
  state: AIState;
  dispatch: React.Dispatch<AIContextAction>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  return (
    <AIContext.Provider value={{ state, dispatch }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};
