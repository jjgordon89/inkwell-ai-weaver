
import { AIProvider } from './types';

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    models: [
      'gpt-4.1-2025-04-14',
      'o3-2025-04-16',
      'o4-mini-2025-04-16',
      'gpt-4.1-mini-2025-04-14',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  {
    name: 'Google Gemini',
    models: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  {
    name: 'Groq',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile', 
      'llama-3.1-8b-instant',
      'llama3-70b-8192', 
      'llama3-8b-8192', 
      'mixtral-8x7b-32768', 
      'gemma2-9b-it',
      'gemma-7b-it'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
  {
    name: 'OpenRouter',
    models: [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-405b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
      'google/gemini-pro-1.5',
      'mistralai/mixtral-8x7b-instruct',
      'anthropic/claude-3-opus',
      'cohere/command-r-plus',
      'qwen/qwen-2.5-72b-instruct'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  {
    name: 'Local Model',
    models: ['llama-7b', 'codellama-13b', 'mistral-7b'],
    requiresApiKey: false
  }
];
