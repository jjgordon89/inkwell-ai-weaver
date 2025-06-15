
import { AIProvider } from './types';

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  {
    name: 'Groq',
    models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    requiresApiKey: true,
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
  {
    name: 'Local Model',
    models: ['llama-7b', 'codellama-13b', 'mistral-7b'],
    requiresApiKey: false
  }
];
