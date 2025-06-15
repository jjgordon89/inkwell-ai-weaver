
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfigurationStatusProps {
  isCurrentProviderConfigured: () => boolean;
  selectedProvider: string;
  selectedModel: string;
}

const ConfigurationStatus = ({ 
  isCurrentProviderConfigured, 
  selectedProvider, 
  selectedModel 
}: ConfigurationStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Provider Configuration:</span>
            {isCurrentProviderConfigured() ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Needs API Key</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Model:</span>
            <span className="text-sm font-medium">{selectedProvider} • {selectedModel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationStatus;
