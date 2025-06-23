
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
