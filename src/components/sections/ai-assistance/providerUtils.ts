
import React from 'react';
import { Globe, Server } from 'lucide-react';

export const getProviderIcon = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return React.createElement(Globe, { className: "h-4 w-4" });
    case 'Groq':
      return React.createElement(Server, { className: "h-4 w-4 text-orange-500" });
    case 'Local Model':
      return React.createElement(Server, { className: "h-4 w-4" });
    default:
      return React.createElement(Globe, { className: "h-4 w-4" });
  }
};

export const getProviderDescription = (providerName: string) => {
  switch (providerName) {
    case 'OpenAI':
      return 'OpenAI\'s GPT models for high-quality text processing';
    case 'Groq':
      return 'Groq\'s fast inference engine with open-source models';
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
    case 'Groq':
      return 'https://console.groq.com/keys';
    default:
      return null;
  }
};
