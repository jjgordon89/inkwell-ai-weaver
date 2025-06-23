
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
    models: [
      'gemini-2.0-flash-exp',
      'gemini-exp-1206',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-pro',
      'gemini-pro-vision'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    type: 'cloud'
  },
  {
    name: 'Groq',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-groq-70b-8192-tool-use-preview',
      'llama3-groq-8b-8192-tool-use-preview',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
      'gemma-7b-it'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    type: 'cloud'
  },
  {
    name: 'OpenRouter',
    models: [
      // Free OpenAI models
      'openai/gpt-3.5-turbo',
      'openai/gpt-3.5-turbo-0125',
      'openai/gpt-3.5-turbo-1106',
      'openai/gpt-3.5-turbo-16k',
      
      // Free Meta Llama models
      'meta-llama/llama-3.2-1b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3-8b-instruct:free',
      'meta-llama/codellama-34b-instruct:free',
      
      // Free Microsoft models
      'microsoft/phi-3-mini-128k-instruct:free',
      'microsoft/phi-3-medium-128k-instruct:free',
      
      // Free Google models
      'google/gemma-2-9b-it:free',
      'google/gemma-7b-it:free',
      'google/gemma-2b-it:free',
      
      // Free Mistral models
      'mistralai/mistral-7b-instruct:free',
      'mistralai/mixtral-8x7b-instruct:free',
      'mistralai/codestral-mamba',
      
      // Free HuggingFace models
      'huggingfaceh4/zephyr-7b-beta:free',
      'openchat/openchat-7b:free',
      'gryphe/mythomist-7b:free',
      'undi95/toppy-m-7b:free',
      
      // Free Anthropic-style models
      'anthropic/claude-3-haiku:beta',
      
      // Free Cohere models
      'cohere/command-r:free',
      'cohere/command-r-plus:free',
      
      // Free Qwen models
      'qwen/qwen-2-7b-instruct:free',
      'qwen/qwen-2.5-7b-instruct:free',
      
      // Free Nous Research models
      'nousresearch/nous-capybara-7b:free',
      'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',
      
      // Free AI21 models
      'ai21/jamba-instruct:free',
      
      // Free Liquid models
      'liquid/lfm-40b:free',
      
      // Free 01-ai models
      '01-ai/yi-34b-chat:free',
      
      // Free Databricks models
      'databricks/dbrx-instruct:free',
      
      // Free Deepseek models
      'deepseek/deepseek-chat:free',
      'deepseek/deepseek-coder:free'
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
