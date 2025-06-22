
// Model information utilities

import { LocalModelInfo } from './types';

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
