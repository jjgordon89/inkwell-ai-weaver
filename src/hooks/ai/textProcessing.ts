
import { AIAction, AIProvider } from './types';

export const getPromptForAction = (action: AIAction, text: string): string => {
  switch (action) {
    case 'improve':
      return `Please improve the following text by enhancing clarity, flow, and readability while maintaining the original meaning and tone:\n\n${text}`;
    case 'shorten':
      return `Please make the following text more concise and brief while preserving all key information and meaning:\n\n${text}`;
    case 'expand':
      return `Please expand the following text by adding relevant details, context, examples, and depth while maintaining the original tone and meaning:\n\n${text}`;
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
    case 'analyze-writing-quality':
      return `Analyze the following text for writing quality. Provide the analysis in the following key-value format.
ReadabilityScore: [a score from 0 to 100]
ReadabilityLevel: [a level like 'Excellent', 'Good', 'Fair', 'Needs Improvement']
ReadabilitySuggestions: [a bulleted list of 2-3 suggestions for readability, separated by newlines]
SentenceVariety: [a score from 0 to 100]
VocabularyRichness: [a score from 0 to 100]
Pacing: [a string like 'Slow', 'Moderate', 'Fast']
Engagement: [a score from 0 to 100]

Text to analyze:
${text}`;
    case 'predict-next-words':
      return `Based on the following text, predict the next 5 most likely words. Return them as a comma-separated list, without any other text:\n\n${text}`;
    default:
      return text;
  }
};

export const performMockTextProcessing = async (text: string, action: AIAction, selectedModel: string): Promise<string> => {
  const processingTime = Math.random() * 2000 + 1000;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  switch (action) {
    case 'improve':
      return `Enhanced version: ${text.replace(/\b(good|nice|ok)\b/gi, 'excellent').replace(/\b(bad|poor)\b/gi, 'suboptimal')}. This improved text flows better and uses more precise vocabulary while maintaining the original meaning.`;
    case 'shorten': {
      const words = text.split(' ');
      const targetLength = Math.max(Math.floor(words.length * 0.5), 3);
      const shortened = words.slice(0, targetLength).join(' ');
      return shortened + (targetLength < words.length ? '.' : '');
    }
    case 'expand':
      return `${text} This expanded version provides additional context, relevant details, and deeper exploration of the concepts presented. The enhancement maintains the original tone while offering readers a more comprehensive understanding of the subject matter, including supporting examples and elaborative explanations that enrich the overall narrative.`;
    case 'fix-grammar':
      return text
        .replace(/\bi\b/g, 'I')
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => `${punct} ${letter.toUpperCase()}`)
        .replace(/([a-z])([.!?])([A-Z])/g, (match, char1, punct, char2) => `${char1}${punct} ${char2}`)
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
    case 'analyze-writing-quality':
      return `ReadabilityScore: 85
ReadabilityLevel: Good
ReadabilitySuggestions:
- Consider varying sentence length for better flow.
- Use more active voice constructions.
SentenceVariety: 78
VocabularyRichness: 65
Pacing: Moderate
Engagement: 82`;
    case 'predict-next-words':
      return `suddenly, then, however, because, with`;
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
    headers['X-Title'] = 'Inkwell AI Weaver';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (!provider.apiEndpoint) {
    return null;
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

const makeOllamaAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  const requestBody = {
    model: selectedModel,
    prompt: prompt,
    stream: false,
    options: {
      temperature: action === 'fix-grammar' ? 0.1 : 0.7,
      num_predict: 1000
    }
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || null;
    }
  } catch (error) {
    console.warn(`Ollama API error, falling back to mock processing:`, error);
  }

  return null;
};

const makeLMStudioAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  // LM Studio uses OpenAI-compatible API format
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
    temperature: action === 'fix-grammar' ? 0.1 : 0.7,
    stream: false
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // LM Studio doesn't typically require auth for local access
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (error) {
    console.warn(`LM Studio API error, falling back to mock processing:`, error);
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

  // Handle different provider types
  switch (provider.name) {
    case 'Google Gemini':
      return makeGeminiAPIRequest(provider, apiKey, selectedModel, prompt, action);
    
    case 'Ollama':
      return makeOllamaAPIRequest(provider, apiKey, selectedModel, prompt, action);
    
    case 'LM Studio':
      return makeLMStudioAPIRequest(provider, apiKey, selectedModel, prompt, action);
    
    default:
      // Handle OpenAI-compatible APIs (OpenAI, Groq, OpenRouter)
      return makeOpenAICompatibleAPIRequest(provider, apiKey, selectedModel, prompt, action);
  }
};
