
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Settings } from 'lucide-react';

interface ProviderStatusProps {
  selectedProvider: string;
  selectedModel: string;
  isCurrentProviderConfigured: () => boolean;
}

const ProviderStatus: React.FC<ProviderStatusProps> = ({
  selectedProvider,
  selectedModel,
  isCurrentProviderConfigured
}) => {
  return (
    <>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Using:</span>
        <Badge variant="outline" className="text-xs">
          {selectedProvider} • {selectedModel}
        </Badge>
        {!isCurrentProviderConfigured() && (
          <Badge variant="destructive" className="text-xs">
            <Key className="h-3 w-3 mr-1" />
            API Key Required
          </Badge>
        )}
      </div>

      {!isCurrentProviderConfigured() && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Please configure your {selectedProvider} API key in the AI Assistance settings to use text processing features.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ProviderStatus;
