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
    case 'analyze-tone':
      return `Analyze the tone, mood, and style of the following text. Provide specific observations about the emotional resonance, voice, and narrative approach:\n\n${text}`;
    case 'generate-plot':
      return `Based on the following story context, generate creative plot elements, conflicts, and story developments:\n\n${text}`;
    case 'continue-story':
      return `Continue the following story naturally, maintaining the established tone, style, and narrative voice:\n\n${text}`;
    case 'writing-prompt':
      return `Create an engaging and creative writing prompt based on the following theme or context:\n\n${text}`;
    case 'context-suggestion':
      return `Provide contextual writing suggestions and improvements based on the following text:\n\n${text}`;
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
    case 'analyze-tone':
      return `Tone: Thoughtful and engaging\nConfidence: 85\nStyle Notes: The writing demonstrates clear narrative voice with balanced pacing\nSuggestions: Consider varying sentence length for rhythm\nConsider adding more sensory details\nMaintain consistent point of view throughout`;
    case 'generate-plot':
      return `Type: conflict\nDescription: A hidden secret from the protagonist's past threatens their current relationships\nPlacement: middle\n\nType: character-development\nDescription: The main character must choose between personal safety and protecting others\nPlacement: middle\n\nType: twist\nDescription: An ally reveals unexpected motivations that change everything\nPlacement: end`;
    case 'continue-story':
      return `The continuation flows naturally from your text, developing the scene further while maintaining the established tone and moving the narrative forward with appropriate pacing and character development.`;
    case 'writing-prompt':
      return `Title: The Memory Thief\nPrompt: In a world where memories can be extracted and traded like currency, your character discovers they have been stealing memories without knowing it. Write about their first conscious theft and the moral dilemma that follows.\nGenre: science fiction\nDifficulty: intermediate`;
    case 'context-suggestion':
      return `- Consider developing the emotional stakes in this scene\n- Add more specific sensory details to enhance immersion\n- The pacing could benefit from shorter sentences during tense moments\n- Character motivations could be clearer\n- Consider the setting's impact on the mood`;
    default:
      return text;
  }
};

const makeGeminiAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: action === 'fix-grammar' ? 0.1 : 0.7,
      maxOutputTokens: 1000
    }
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/${selectedModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (error) {
    console.warn(`Gemini API error, falling back to mock processing:`, error);
  }

  return null;
};

const makeOpenAICompatibleAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // OpenRouter requires specific headers
  if (provider.name === 'OpenRouter') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Lovable Writing Assistant';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(provider.apiEndpoint, {
      method: 'POST',
      headers,
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

export const makeAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  if (!provider.apiEndpoint) return null;

  // Handle Google Gemini API differently
  if (provider.name === 'Google Gemini') {
    return makeGeminiAPIRequest(provider, apiKey, selectedModel, prompt, action);
  }

  // Handle OpenAI-compatible APIs (OpenAI, Groq, OpenRouter)
  return makeOpenAICompatibleAPIRequest(provider, apiKey, selectedModel, prompt, action);
};
