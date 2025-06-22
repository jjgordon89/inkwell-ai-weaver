
// Model fetching utilities for local providers

import { OllamaModel, LMStudioModel } from './types';

/**
 * Fetch available models from Ollama
 */
export async function fetchOllamaModels(endpoint = 'http://localhost:11434'): Promise<string[]> {
  try {
    const response = await fetch(`${endpoint}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.models?.map((model: OllamaModel) => model.name) || [];
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    return [];
  }
}

/**
 * Fetch available models from LM Studio
 */
export async function fetchLMStudioModels(endpoint = 'http://localhost:1234'): Promise<string[]> {
  try {
    const response = await fetch(`${endpoint}/v1/models`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data?.map((model: LMStudioModel) => model.id) || [];
  } catch (error) {
    console.error('Failed to fetch LM Studio models:', error);
    return [];
  }
}
