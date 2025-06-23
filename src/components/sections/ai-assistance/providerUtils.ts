
import React from 'react';
import { 
  Bot, 
  Brain, 
  Globe, 
  Zap, 
  Code, 
  Cpu, 
  Database,
  Settings,
  Monitor,
  Server
} from 'lucide-react';

export const getProviderIcon = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return React.createElement(Brain, { className: "h-4 w-4" });
    case 'Claude':
    case 'Anthropic (Direct)':
      return React.createElement(Bot, { className: "h-4 w-4" });
    case 'Google Gemini':
      return React.createElement(Zap, { className: "h-4 w-4" });
    case 'Groq':
      return React.createElement(Cpu, { className: "h-4 w-4" });
    case 'Together AI':
    case 'Fireworks AI':
    case 'DeepSeek':
    case 'Cohere':
    case 'Mistral AI':
    case 'Perplexity':
      return React.createElement(Code, { className: "h-4 w-4" });
    case 'OpenRouter':
      return React.createElement(Globe, { className: "h-4 w-4" });
    case 'Custom OpenAI Compatible':
      return React.createElement(Settings, { className: "h-4 w-4" });
    case 'Ollama':
      return React.createElement(Monitor, { className: "h-4 w-4" });
    case 'LM Studio':
      return React.createElement(Server, { className: "h-4 w-4" });
    default:
      return React.createElement(Globe, { className: "h-4 w-4" });
  }
};

export const getProviderDescription = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return 'Industry-leading GPT models including GPT-4.1 and advanced reasoning models like o3';
    case 'Custom OpenAI Compatible':
      return 'Configure your own OpenAI-compatible endpoint with custom models';
    case 'Claude':
    case 'Anthropic (Direct)':
      return 'Anthropic\'s Claude models with advanced reasoning capabilities';
    case 'Google Gemini':
      return 'Google\'s advanced Gemini models with multimodal capabilities';
    case 'Groq':
      return 'Groq\'s fast inference engine with open-source models';
    case 'Together AI':
      return 'Access to various open-source models through Together AI';
    case 'Fireworks AI':
      return 'Fast inference for open-source and proprietary models';
    case 'DeepSeek':
      return 'DeepSeek\'s advanced reasoning and coding models';
    case 'Cohere':
      return 'Cohere\'s command models for text generation and analysis';
    case 'Mistral AI':
      return 'Mistral\'s open-source and proprietary language models';
    case 'Perplexity':
      return 'Perplexity\'s search-augmented language models';
    case 'OpenRouter':
      return 'Access to multiple AI providers through one unified API';
    case 'Ollama':
      return 'Run AI models locally using Ollama';
    case 'LM Studio':
      return 'Local AI model inference with LM Studio';
    default:
      return 'AI language model provider';
  }
};

export const getProviderSetupLink = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return 'https://platform.openai.com/api-keys';
    case 'Claude':
    case 'Anthropic (Direct)':
      return 'https://console.anthropic.com/';
    case 'Google Gemini':
      return 'https://aistudio.google.com/app/apikey';
    case 'Groq':
      return 'https://console.groq.com/keys';
    case 'Together AI':
      return 'https://api.together.xyz/settings/api-keys';
    case 'Fireworks AI':
      return 'https://fireworks.ai/api-keys';
    case 'DeepSeek':
      return 'https://platform.deepseek.com/api_keys';
    case 'Cohere':
      return 'https://dashboard.cohere.ai/api-keys';
    case 'Mistral AI':
      return 'https://console.mistral.ai/api-keys';
    case 'Perplexity':
      return 'https://www.perplexity.ai/settings/api';
    case 'OpenRouter':
      return 'https://openrouter.ai/keys';
    case 'Custom OpenAI Compatible':
      return null; // No external setup link for custom endpoints
    case 'Ollama':
      return 'https://ollama.com/download';
    case 'LM Studio':
      return 'https://lmstudio.ai/';
    default:
      return null;
  }
};
