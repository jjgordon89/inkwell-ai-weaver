
// Connection testing utilities for local model providers

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
