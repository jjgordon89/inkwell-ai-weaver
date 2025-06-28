
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from 'lucide-react';
import { AIProvider } from '@/hooks/useAI';
import { getProviderIcon } from './providerUtils';

interface ProviderSelectorProps {
  selectedProvider: string;
  availableProviders: AIProvider[];
  onProviderChange: (provider: string) => void;
  providerJustChanged: boolean;
}

const ProviderSelector = ({ 
  selectedProvider, 
  availableProviders, 
  onProviderChange, 
  providerJustChanged 
}: ProviderSelectorProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Selected Provider</label>
      <Select value={selectedProvider} onValueChange={onProviderChange}>
        <SelectTrigger className={providerJustChanged ? "ring-2 ring-green-500 ring-offset-2" : ""}>
          <SelectValue placeholder="Select a provider">
            {selectedProvider && (
              <div className="flex items-center gap-2">
                {getProviderIcon(selectedProvider)}
                {selectedProvider}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {availableProviders.map((provider) => (
            <SelectItem key={provider.name} value={provider.name}>
              <div className="flex items-center gap-2">
                {getProviderIcon(provider.name)}
                {provider.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProviderSelector;
