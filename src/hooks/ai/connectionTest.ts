
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

  // Handle Google Gemini API differently
  if (provider.name === 'Google Gemini') {
    return testGeminiConnection(provider, apiKey);
  }

  // Handle OpenAI-compatible APIs (OpenAI, Groq, OpenRouter)
  return testOpenAICompatibleConnection(provider, apiKey);
};
