
import React from 'react';
import { Globe, Server, Brain, Zap, Bot } from 'lucide-react';

export const getProviderIcon = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return React.createElement(Bot, { className: "h-4 w-4 text-green-600" });
    case 'Google Gemini':
      return React.createElement(Brain, { className: "h-4 w-4 text-blue-500" });
    case 'Groq':
      return React.createElement(Server, { className: "h-4 w-4 text-orange-500" });
    case 'OpenRouter':
      return React.createElement(Zap, { className: "h-4 w-4 text-purple-500" });
    case 'Local Model':
      return React.createElement(Server, { className: "h-4 w-4" });
    default:
      return React.createElement(Globe, { className: "h-4 w-4" });
  }
};

export const getProviderDescription = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return 'Industry-leading GPT models including GPT-4.1 and advanced reasoning models like o3';
    case 'Google Gemini':
      return 'Google\'s advanced Gemini models with multimodal capabilities';
    case 'Groq':
      return 'Groq\'s fast inference engine with open-source models';
    case 'OpenRouter':
      return 'Access to multiple AI providers through one unified API';
    case 'Local Model':
      return 'Run AI models locally on your machine';
    default:
      return 'AI language model provider';
  }
};

export const getProviderSetupLink = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return 'https://platform.openai.com/api-keys';
    case 'Google Gemini':
      return 'https://aistudio.google.com/app/apikey';
    case 'Groq':
      return 'https://console.groq.com/keys';
    case 'OpenRouter':
      return 'https://openrouter.ai/keys';
    default:
      return null;
  }
};
