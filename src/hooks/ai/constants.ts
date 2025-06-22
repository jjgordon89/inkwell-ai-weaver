
import type { AIProvider } from './types';

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    models: [
      'gpt-4.1-2025-04-14',
      'o3-2025-04-16', 
      'o4-mini-2025-04-16',
      'gpt-4.1-mini-2025-04-14',
      'gpt-4o'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    type: 'cloud'
  },
  {
    name: 'Claude',
    models: [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-5-haiku-20241022',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    type: 'cloud'
  },
  {
    name: 'Google Gemini',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro'],
    requiresApiKey: true,
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    type: 'cloud'
  },
  {
    name: 'Groq',
    models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    requiresApiKey: true,
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    type: 'cloud'
  },
  {
    name: 'OpenRouter',
    models: [
      'openai/gpt-4-turbo',
      'anthropic/claude-3-opus',
      'meta-llama/llama-3-70b-instruct',
      'mistralai/mixtral-8x22b-instruct'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    type: 'cloud'
  },
  {
    name: 'Ollama',
    models: [], // Will be populated dynamically
    requiresApiKey: false,
    apiEndpoint: 'http://localhost:11434',
    type: 'local'
  },
  {
    name: 'LM Studio',
    models: [], // Will be populated dynamically
    requiresApiKey: false,
    apiEndpoint: 'http://localhost:1234',
    type: 'local'
  }
];
