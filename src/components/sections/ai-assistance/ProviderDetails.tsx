
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Key } from 'lucide-react';
import { AIProvider } from '@/hooks/useAI';
import { getProviderIcon, getProviderDescription } from './providerUtils';

interface ProviderDetailsProps {
  provider: AIProvider;
  providerJustChanged: boolean;
}

const ProviderDetails = ({ provider, providerJustChanged }: ProviderDetailsProps) => {
  return (
    <div className={`space-y-4 p-4 bg-muted/30 rounded-lg transition-all duration-300 ${
      providerJustChanged ? 'ring-2 ring-green-500 ring-offset-2 bg-green-50/50' : ''
    }`}>
      <div className="flex items-center gap-2">
        {getProviderIcon(provider.name)}
        <span className="font-medium">{provider.name}</span>
        {provider.requiresApiKey && (
          <Badge variant="outline" className="text-xs">
            <Key className="h-3 w-3 mr-1" />
            API Key Required
          </Badge>
        )}
        {providerJustChanged && (
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
            Active
          </Badge>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{getProviderDescription(provider.name)}</p>
        <p>Available models: {provider.models.length}</p>
        <p className="text-xs">Models: {provider.models.join(', ')}</p>
      </div>
    </div>
  );
};

export default ProviderDetails;
