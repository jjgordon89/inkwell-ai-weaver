
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AIProvider } from '@/hooks/ai/types';

export interface AIState {
  // Provider and model settings
  selectedProvider: string;
  selectedModel: string;
  availableProviders: AIProvider[];
  
  // API keys and configuration
  apiKeys: Record<string, string>;
  
  // Processing states
  isProcessing: boolean;
  isTestingConnection: boolean;
  isGenerating: boolean;
  
  // Error handling
  error: Error | null;
  lastOperation: string | null;
  
  // Results cache
  resultsCache: Map<string, { result: string; timestamp: number }>;
  
  // Settings
  settings: {
    autoSuggest: boolean;
    realTimeProcessing: boolean;
    maxTokens: string;
    temperature: string;
    cacheEnabled: boolean;
    cacheExpiryMs: number;
  };
}

export type AIContextAction = 
  | { type: 'SET_PROVIDER'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_API_KEY'; payload: { provider: string; key: string } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_TESTING_CONNECTION'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { error: Error | null; operation?: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AIState['settings']> }
  | { type: 'CACHE_RESULT'; payload: { key: string; result: string } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'LOAD_INITIAL_STATE'; payload: Partial<AIState> };

const initialState: AIState = {
  selectedProvider: 'OpenAI',
  selectedModel: 'gpt-4.1-2025-04-14',
  availableProviders: [],
  apiKeys: {},
  isProcessing: false,
  isTestingConnection: false,
  isGenerating: false,
  error: null,
  lastOperation: null,
  resultsCache: new Map(),
  settings: {
    autoSuggest: true,
    realTimeProcessing: false,
    maxTokens: '1000',
    temperature: '0.7',
    cacheEnabled: true,
    cacheExpiryMs: 300000 // 5 minutes
  }
};

function aiReducer(state: AIState, action: AIContextAction): AIState {
  switch (action.type) {
    case 'SET_PROVIDER':
      return {
        ...state,
        selectedProvider: action.payload,
        error: null
      };
      
    case 'SET_MODEL':
      return {
        ...state,
        selectedModel: action.payload,
        error: null
      };
      
    case 'SET_API_KEY':
      return {
        ...state,
        apiKeys: {
          ...state.apiKeys,
          [action.payload.provider]: action.payload.key
        },
        error: null
      };
      
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
        error: action.payload ? null : state.error
      };
      
    case 'SET_TESTING_CONNECTION':
      return {
        ...state,
        isTestingConnection: action.payload,
        error: action.payload ? null : state.error
      };
      
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
        error: action.payload ? null : state.error
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        lastOperation: action.payload.operation || state.lastOperation,
        isProcessing: false,
        isTestingConnection: false,
        isGenerating: false
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        lastOperation: null
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    case 'CACHE_RESULT': {
      const newCache = new Map(state.resultsCache);
      newCache.set(action.payload.key, {
        result: action.payload.result,
        timestamp: Date.now()
      });
      return {
        ...state,
        resultsCache: newCache
      };
    }
      
    case 'CLEAR_CACHE':
      return {
        ...state,
        resultsCache: new Map()
      };
      
    case 'LOAD_INITIAL_STATE':
      return {
        ...state,
        ...action.payload
      };
      
    default:
      return state;
  }
}

interface AIContextType {
  state: AIState;
  dispatch: React.Dispatch<AIContextAction>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIContextProvider = ({ children }: AIProviderProps) => {
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
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
};
