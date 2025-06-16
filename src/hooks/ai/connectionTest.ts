
import { AIProvider } from './types';

const testGeminiConnection = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
  const testPayload = {
    contents: [{
      parts: [{
        text: 'Hello, this is a connection test. Please respond with "OK".'
      }]
    }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 10
    }
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/${provider.models[0]}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      console.log(`✅ Connection test successful for ${provider.name}`);
      return true;
    } else {
      const errorData = await response.text();
      console.error(`❌ Connection test failed for ${provider.name}:`, response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error(`❌ Connection test failed for ${provider.name}:`, error);
    return false;
  }
};

const testOpenAICompatibleConnection = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
  const testPayload = {
    model: provider.models[0],
    messages: [
      {
        role: 'user',
        content: 'Hello, this is a connection test. Please respond with "OK".'
      }
    ],
    max_tokens: 10,
    temperature: 0
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // OpenRouter requires a different authorization header format
  if (provider.name === 'OpenRouter') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Inkwell AI Weaver';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(provider.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      console.log(`✅ Connection test successful for ${provider.name}`);
      return true;
    } else {
      const errorData = await response.text();
      console.error(`❌ Connection test failed for ${provider.name}:`, response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error(`❌ Connection test failed for ${provider.name}:`, error);
    return false;
  }
};

const testOllamaConnection = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
  try {
    // First check if Ollama is running by getting available models
    const response = await fetch(`${provider.apiEndpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.models && data.models.length > 0) {
        console.log(`✅ Connection test successful for ${provider.name} (${data.models.length} models available)`);
        return true;
      } else {
        console.warn(`⚠️ Ollama is running but no models are available. Install models using: ollama pull llama2`);
        return false;
      }
    } else {
      console.error(`❌ Connection test failed for ${provider.name}:`, response.status);
      return false;
    }
  } catch (error) {
    console.error(`❌ Connection test failed for ${provider.name}:`, error);
    return false;
  }
};

const testLMStudioConnection = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
  try {
    // Check if LM Studio server is running
    const response = await fetch(`${provider.apiEndpoint}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        console.log(`✅ Connection test successful for ${provider.name} (${data.data.length} models available)`);
        return true;
      } else {
        console.warn(`⚠️ LM Studio is running but no models are loaded. Load a model in LM Studio first.`);
        return false;
      }
    } else {
      console.error(`❌ Connection test failed for ${provider.name}:`, response.status);
      return false;
    }
  } catch (error) {
    console.error(`❌ Connection test failed for ${provider.name}:`, error);
    return false;
  }
};

export const testProviderConnection = async (
  provider: AIProvider, 
  apiKey: string
): Promise<boolean> => {
  if (!provider.apiEndpoint) {
    console.log(`No API endpoint configured for ${provider.name}, using mock test`);
    // Simulate API test for providers without endpoints
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.2;
    console.log(success ? `✅ Mock test successful for ${provider.name}` : `❌ Mock test failed for ${provider.name}`);
    return success;
  }

  // Handle different provider types
  switch (provider.name) {
    case 'Google Gemini':
      return testGeminiConnection(provider, apiKey);
    
    case 'Ollama':
      return testOllamaConnection(provider, apiKey);
    
    case 'LM Studio':
      return testLMStudioConnection(provider, apiKey);
    
    default:
      // Handle OpenAI-compatible APIs (OpenAI, Groq, OpenRouter)
      return testOpenAICompatibleConnection(provider, apiKey);
  }
};
