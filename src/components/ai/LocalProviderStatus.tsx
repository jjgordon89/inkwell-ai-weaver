import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, RefreshCw, Monitor, Server, ExternalLink } from 'lucide-react';
import { checkOllamaConnection, checkLMStudioConnection } from '@/utils/localModels';

interface LocalProviderStatusProps {
  providerName: 'Ollama' | 'LM Studio';
  endpoint?: string;
  className?: string;
}

export const LocalProviderStatus: React.FC<LocalProviderStatusProps> = ({ 
  providerName, 
  endpoint,
  className = '' 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      let connected = false;
      if (providerName === 'Ollama') {
        connected = await checkOllamaConnection(endpoint);
      } else if (providerName === 'LM Studio') {
        connected = await checkLMStudioConnection(endpoint);
      }
      setIsConnected(connected);
      setLastChecked(new Date());
    } catch (error) {
      console.error(`Failed to check ${providerName} connection:`, error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [providerName, endpoint]);

  const getStatusBadge = () => {
    if (isChecking) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (isConnected === null) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
          <Monitor className="h-3 w-3 mr-1" />
          Unknown
        </Badge>
      );
    }

    if (isConnected) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  const getSetupInstructions = () => {
    if (providerName === 'Ollama') {
      return {
        downloadUrl: 'https://ollama.ai',
        instructions: [
          'Download and install Ollama from ollama.ai',
          'Open terminal and run: ollama pull llama2',
          'Ensure Ollama is running on localhost:11434'
        ]
      };
    } else {
      return {
        downloadUrl: 'https://lmstudio.ai',
        instructions: [
          'Download and install LM Studio from lmstudio.ai',
          'Load a model in LM Studio',
          'Start the local server (usually on localhost:1234)'
        ]
      };
    }
  };

  const setup = getSetupInstructions();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          <span className="font-medium text-sm">{providerName} Status</span>
          {getStatusBadge()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
          className="h-8 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {lastChecked && (
        <p className="text-xs text-muted-foreground">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}

      {isConnected === false && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="font-medium">{providerName} is not running</p>
            <div className="space-y-1">
              {setup.instructions.map((instruction, index) => (
                <p key={index} className="text-sm">
                  {index + 1}. {instruction}
                </p>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(setup.downloadUrl, '_blank')}
              className="mt-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Download {providerName}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isConnected === true && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <span className="text-green-600 font-medium">
              {providerName} is running and ready to use!
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LocalProviderStatus;
