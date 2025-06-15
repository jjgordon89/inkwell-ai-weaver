
import { AIAction, AIProvider } from './types';

export const getPromptForAction = (action: AIAction, text: string): string => {
  switch (action) {
    case 'improve':
      return `Please improve the following text by enhancing clarity, flow, and readability while maintaining the original meaning:\n\n${text}`;
    case 'shorten':
      return `Please make the following text more concise while preserving the key information and meaning:\n\n${text}`;
    case 'expand':
      return `Please expand the following text by adding relevant details, context, and depth while maintaining the original tone and meaning:\n\n${text}`;
    case 'fix-grammar':
      return `Please correct any grammar, punctuation, and spelling errors in the following text while maintaining its original meaning and tone:\n\n${text}`;
    default:
      return text;
  }
};

export const performMockTextProcessing = async (text: string, action: AIAction, selectedModel: string): Promise<string> => {
  const processingTime = Math.random() * 2000 + 1000;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  switch (action) {
    case 'improve':
      return `Enhanced version using ${selectedModel}: ${text.replace(/\b(good|nice|ok)\b/gi, 'excellent').replace(/\b(bad|poor)\b/gi, 'suboptimal')}`;
    case 'shorten':
      const words = text.split(' ');
      const targetLength = Math.max(Math.floor(words.length * 0.7), 3);
      return words.slice(0, targetLength).join(' ') + (targetLength < words.length ? '...' : '');
    case 'expand':
      return `${text} This expanded version provides additional context and detail, offering readers a more comprehensive understanding of the topic while maintaining the original meaning and intent.`;
    case 'fix-grammar':
      return text
        .replace(/\bi\b/g, 'I')
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => `${punct} ${letter.toUpperCase()}`)
        .trim();
    default:
      return text;
  }
};

export const makeAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  if (!provider.apiEndpoint) return null;

  const requestBody = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful writing assistant. Follow the user\'s instructions precisely.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: action === 'fix-grammar' ? 0.1 : 0.7
  };

  try {
    const response = await fetch(provider.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (error) {
    console.warn(`API error, falling back to mock processing:`, error);
  }

  return null;
};
