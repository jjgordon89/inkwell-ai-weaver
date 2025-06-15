
import { useState } from 'react';
import { testProviderConnection } from './connectionTest';
import { AI_PROVIDERS } from './constants';

export const useAIConnection = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async (providerName: string, apiKeys: Record<string, string>): Promise<boolean> => {
    const apiKey = apiKeys[providerName];
    if (!apiKey) {
      console.error('No API key provided for', providerName);
      return false;
    }

    setIsTestingConnection(true);
    
    try {
      console.log(`Testing connection for ${providerName}...`);
      
      const provider = AI_PROVIDERS.find(p => p.name === providerName);
      if (!provider) {
        return false;
      }

      return await testProviderConnection(provider, apiKey);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    isTestingConnection,
    testConnection
  };
};
