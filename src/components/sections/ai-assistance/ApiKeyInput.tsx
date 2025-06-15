
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { AIProvider } from '@/hooks/useAI';
import { getProviderSetupLink } from './providerUtils';

interface ApiKeyInputProps {
  provider: AIProvider;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onTestConnection: () => void;
  isTestingConnection: boolean;
}

const ApiKeyInput = ({ 
  provider, 
  apiKey, 
  onApiKeyChange, 
  onTestConnection, 
  isTestingConnection 
}: ApiKeyInputProps) => {
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prev => !prev);
  };

  const setupLink = getProviderSetupLink(provider.name);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">API Key</label>
        {setupLink && (
          <a
            href={setupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Get API Key <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showApiKey ? "text" : "password"}
            placeholder={`Enter your ${provider.name} API key`}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={toggleApiKeyVisibility}
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onTestConnection}
          disabled={!apiKey || isTestingConnection}
        >
          {isTestingConnection ? 'Testing...' : 'Test'}
        </Button>
      </div>
      
      {!apiKey && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          ⚠️ This provider requires an API key to function
        </p>
      )}
      
      {provider.name === 'OpenAI' && (
        <p className="text-xs text-muted-foreground">
          💡 OpenAI offers industry-leading models including GPT-4.1 and advanced reasoning models like o3
        </p>
      )}
      
      {provider.name === 'Groq' && (
        <p className="text-xs text-muted-foreground">
          💡 Groq offers fast inference with open-source models like Llama and Mixtral
        </p>
      )}
      
      {provider.name === 'Google Gemini' && (
        <p className="text-xs text-muted-foreground">
          💡 Google Gemini models support multimodal capabilities including text and images
        </p>
      )}
      
      {provider.name === 'OpenRouter' && (
        <p className="text-xs text-muted-foreground">
          💡 OpenRouter provides access to multiple AI providers including Claude, GPT-4, and Llama through one API
        </p>
      )}
    </div>
  );
};

export default ApiKeyInput;
