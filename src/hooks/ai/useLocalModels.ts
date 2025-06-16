import { useState, useEffect, useCallback } from 'react';
import { 
  checkOllamaConnection, 
  checkLMStudioConnection,
  fetchOllamaModels,
  fetchLMStudioModels 
} from '@/utils/localModels';
import { AI_PROVIDERS } from './constants';

export interface LocalModelState {
  ollama: {
    connected: boolean;
    models: string[];
    endpoint: string;
  };
  lmStudio: {
    connected: boolean;
    models: string[];
    endpoint: string;
  };
  loading: boolean;
  lastChecked: Date | null;
}

export const useLocalModels = () => {
  const [state, setState] = useState<LocalModelState>({
    ollama: {
      connected: false,
      models: [],
      endpoint: 'http://localhost:11434'
    },
    lmStudio: {
      connected: false,
      models: [],
      endpoint: 'http://localhost:1234'
    },
    loading: false,
    lastChecked: null
  });

  // Update AI_PROVIDERS with discovered models
  const updateProviderModels = useCallback((provider: string, models: string[]) => {
    const providerIndex = AI_PROVIDERS.findIndex(p => p.name === provider);
    if (providerIndex !== -1) {
      AI_PROVIDERS[providerIndex].models = models;
    }
  }, []);

  // Check connections and refresh models
  const refreshConnections = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Check Ollama
      const ollamaConnected = await checkOllamaConnection(state.ollama.endpoint);
      let ollamaModels: string[] = [];
      
      if (ollamaConnected) {
        ollamaModels = await fetchOllamaModels(state.ollama.endpoint);
        updateProviderModels('Ollama', ollamaModels);
      }

      // Check LM Studio
      const lmStudioConnected = await checkLMStudioConnection(state.lmStudio.endpoint);
      let lmStudioModels: string[] = [];
      
      if (lmStudioConnected) {
        lmStudioModels = await fetchLMStudioModels(state.lmStudio.endpoint);
        updateProviderModels('LM Studio', lmStudioModels);
      }

      setState(prev => ({
        ...prev,
        ollama: {
          ...prev.ollama,
          connected: ollamaConnected,
          models: ollamaModels
        },
        lmStudio: {
          ...prev.lmStudio,
          connected: lmStudioConnected,
          models: lmStudioModels
        },
        loading: false,
        lastChecked: new Date()
      }));
    } catch (error) {
      console.error('Failed to refresh local model connections:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.ollama.endpoint, state.lmStudio.endpoint, updateProviderModels]);

  // Set custom endpoints
  const setOllamaEndpoint = useCallback((endpoint: string) => {
    setState(prev => ({
      ...prev,
      ollama: { ...prev.ollama, endpoint }
    }));
  }, []);

  const setLMStudioEndpoint = useCallback((endpoint: string) => {
    setState(prev => ({
      ...prev,
      lmStudio: { ...prev.lmStudio, endpoint }
    }));
  }, []);

  // Check connections on mount and periodically
  useEffect(() => {
    refreshConnections();
    
    // Set up periodic checking (every 30 seconds)
    const interval = setInterval(refreshConnections, 30000);
    
    return () => clearInterval(interval);
  }, [refreshConnections]);

  // Save endpoints to localStorage
  useEffect(() => {
    localStorage.setItem('ollama-endpoint', state.ollama.endpoint);
  }, [state.ollama.endpoint]);

  useEffect(() => {
    localStorage.setItem('lmstudio-endpoint', state.lmStudio.endpoint);
  }, [state.lmStudio.endpoint]);

  // Load endpoints from localStorage on mount
  useEffect(() => {
    const savedOllamaEndpoint = localStorage.getItem('ollama-endpoint');
    const savedLMStudioEndpoint = localStorage.getItem('lmstudio-endpoint');

    if (savedOllamaEndpoint) {
      setOllamaEndpoint(savedOllamaEndpoint);
    }
    if (savedLMStudioEndpoint) {
      setLMStudioEndpoint(savedLMStudioEndpoint);
    }
  }, [setOllamaEndpoint, setLMStudioEndpoint]);

  // Get all available local models
  const getAllLocalModels = useCallback(() => {
    return [
      ...state.ollama.models.map(model => ({ provider: 'Ollama', model })),
      ...state.lmStudio.models.map(model => ({ provider: 'LM Studio', model }))
    ];
  }, [state.ollama.models, state.lmStudio.models]);

  // Check if any local provider is connected
  const hasConnectedProvider = useCallback(() => {
    return state.ollama.connected || state.lmStudio.connected;
  }, [state.ollama.connected, state.lmStudio.connected]);

  // Get connection status summary
  const getConnectionStatus = useCallback(() => {
    const connected = [];
    const disconnected = [];

    if (state.ollama.connected) {
      connected.push(`Ollama (${state.ollama.models.length} models)`);
    } else {
      disconnected.push('Ollama');
    }

    if (state.lmStudio.connected) {
      connected.push(`LM Studio (${state.lmStudio.models.length} models)`);
    } else {
      disconnected.push('LM Studio');
    }

    return { connected, disconnected };
  }, [state]);

  return {
    state,
    refreshConnections,
    setOllamaEndpoint,
    setLMStudioEndpoint,
    getAllLocalModels,
    hasConnectedProvider,
    getConnectionStatus,
    updateProviderModels
  };
};
