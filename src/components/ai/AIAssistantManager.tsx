
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Brain, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import AIConfigurationModal from './AIConfigurationModal';

const AIAssistantManager = () => {
  const [showConfig, setShowConfig] = useState(false);
  const { 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured,
    availableProviders 
  } = useAI();

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const isConfigured = isCurrentProviderConfigured();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Assistant Status
          </CardTitle>
          <CardDescription>
            Manage your AI assistance configuration and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Configuration */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium text-sm">{selectedProvider}</div>
              <div className="text-xs text-muted-foreground">{selectedModel}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConfigured ? "default" : "secondary"}>
                {isConfigured ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Setup Required
                  </>
                )}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfig(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>

          {/* Status Information */}
          {isConfigured ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                AI Assistant is ready. You can now use smart writing features, 
                contextual suggestions, and advanced content management tools.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                AI Assistant needs configuration. Click "Configure" to set up your 
                AI provider and start using intelligent writing assistance.
              </AlertDescription>
            </Alert>
          )}

          {/* Available Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Smart Writing', enabled: isConfigured },
                { name: 'Text Completion', enabled: isConfigured },
                { name: 'Content Analysis', enabled: isConfigured },
                { name: 'Research Integration', enabled: isConfigured },
                { name: 'Character Analysis', enabled: isConfigured },
                { name: 'Export Optimization', enabled: isConfigured }
              ].map((feature) => (
                <div 
                  key={feature.name}
                  className={`p-2 rounded text-xs border ${
                    feature.enabled 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {feature.enabled ? (
                      <Zap className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-300" />
                    )}
                    {feature.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AIConfigurationModal 
        isOpen={showConfig} 
        onClose={() => setShowConfig(false)} 
      />
    </div>
  );
};

export default AIAssistantManager;
