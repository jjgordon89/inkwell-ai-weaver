
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
      'gemini-2.0-flash-thinking-exp-1219',
      'gemini-exp-1206',
      'gemini-exp-1121',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b-001',
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
    name: 'Together AI',
    models: [
      'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
      'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'mistralai/Mistral-7B-Instruct-v0.3',
      'microsoft/DialoGPT-medium',
      'togethercomputer/RedPajama-INCITE-7B-Chat',
      'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      'Qwen/Qwen2.5-72B-Instruct',
      'garage-bAInd/Platypus2-70B-instruct'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.together.xyz/v1/chat/completions',
    type: 'cloud'
  },
  {
    name: 'Perplexity',
    models: [
      'llama-3.1-sonar-small-128k-online',
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-huge-128k-online',
      'llama-3.1-sonar-small-128k-chat',
      'llama-3.1-sonar-large-128k-chat',
      'llama-3.1-8b-instruct',
      'llama-3.1-70b-instruct'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.perplexity.ai/chat/completions',
    type: 'cloud'
  },
  {
    name: 'Fireworks AI',
    models: [
      'accounts/fireworks/models/llama-v3p1-405b-instruct',
      'accounts/fireworks/models/llama-v3p1-70b-instruct',
      'accounts/fireworks/models/llama-v3p1-8b-instruct',
      'accounts/fireworks/models/mixtral-8x7b-instruct',
      'accounts/fireworks/models/mixtral-8x22b-instruct',
      'accounts/fireworks/models/qwen2p5-72b-instruct',
      'accounts/fireworks/models/deepseek-v2p5',
      'accounts/fireworks/models/gemma2-9b-it'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
    type: 'cloud'
  },
  {
    name: 'DeepSeek',
    models: [
      'deepseek-chat',
      'deepseek-coder',
      'deepseek-reasoner'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.deepseek.com/chat/completions',
    type: 'cloud'
  },
  {
    name: 'Anthropic (Direct)',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    type: 'cloud'
  },
  {
    name: 'Cohere',
    models: [
      'command-r-plus',
      'command-r',
      'command-nightly',
      'command-light-nightly'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.cohere.ai/v1/chat',
    type: 'cloud'
  },
  {
    name: 'Mistral AI',
    models: [
      'mistral-large-2407',
      'mistral-large-2402',
      'mistral-medium-2312',
      'mistral-small-2402',
      'mistral-small-2312',
      'open-mistral-7b',
      'open-mixtral-8x7b',
      'open-mixtral-8x22b',
      'codestral-2405',
      'codestral-mamba-2407'
    ],
    requiresApiKey: true,
    apiEndpoint: 'https://api.mistral.ai/v1/chat/completions',
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
    name: 'Custom OpenAI Compatible',
    models: ['custom-model'], // Will be updated by user
    requiresApiKey: true,
    apiEndpoint: 'https://api.your-provider.com/v1/chat/completions', // Will be updated by user
    type: 'cloud',
    customEndpoint: true
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
