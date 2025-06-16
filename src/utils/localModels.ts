// Utility functions for local model providers

export interface LocalModelInfo {
  name: string;
  size: string;
  modified_at: string;
  digest: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface LMStudioModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * Check if Ollama is running and accessible
 */
export async function checkOllamaConnection(endpoint = 'http://localhost:11434'): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('Ollama connection failed:', error);
    return false;
  }
}

/**
 * Check if LM Studio is running and accessible
 */
export async function checkLMStudioConnection(endpoint = 'http://localhost:1234'): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('LM Studio connection failed:', error);
    return false;
  }
}

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

/**
 * Get detailed information about an Ollama model
 */
export async function getOllamaModelInfo(modelName: string, endpoint = 'http://localhost:11434'): Promise<LocalModelInfo | null> {
  try {
    const response = await fetch(`${endpoint}/api/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: modelName }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      name: data.modelfile?.name || modelName,
      size: data.details?.parameter_size || 'Unknown',
      modified_at: data.modified_at || '',
      digest: data.digest || '',
      details: data.details
    };
  } catch (error) {
    console.error('Failed to get Ollama model info:', error);
    return null;
  }
}

/**
 * Format model size for display
 */
export function formatModelSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get a friendly name for a model
 */
export function getModelDisplayName(modelName: string): string {
  // Remove common suffixes and make more readable
  return modelName
    .replace(/:latest$/, '')
    .replace(/-instruct$/, ' (Instruct)')
    .replace(/-chat$/, ' (Chat)')
    .replace(/-code$/, ' (Code)')
    .replace(/(\d+)b/i, ' $1B')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Check if a model name suggests it's good for coding
 */
export function isCodeModel(modelName: string): boolean {
  const codeKeywords = ['code', 'codellama', 'deepseek', 'starcoder', 'wizard', 'phind'];
  return codeKeywords.some(keyword => 
    modelName.toLowerCase().includes(keyword)
  );
}

/**
 * Check if a model name suggests it's an instruct/chat model
 */
export function isChatModel(modelName: string): boolean {
  const chatKeywords = ['instruct', 'chat', 'assistant', 'conversational'];
  return chatKeywords.some(keyword => 
    modelName.toLowerCase().includes(keyword)
  );
}

/**
 * Get estimated model size category
 */
export function getModelSizeCategory(modelName: string): 'small' | 'medium' | 'large' | 'unknown' {
  const match = modelName.match(/(\d+)b/i);
  if (!match) return 'unknown';
  
  const sizeB = parseInt(match[1]);
  if (sizeB <= 7) return 'small';
  if (sizeB <= 30) return 'medium';
  return 'large';
}
