import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Download,
  Server,
  Cpu,
  HardDrive
} from 'lucide-react';
import { 
  checkOllamaConnection, 
  checkLMStudioConnection,
  fetchOllamaModels,
  fetchLMStudioModels,
  getModelDisplayName,
  getModelSizeCategory,
  isCodeModel,
  isChatModel
} from '@/utils/localModels';

interface LocalModelManagerProps {
  onModelsUpdate: (provider: string, models: string[]) => void;
}

const LocalModelManager: React.FC<LocalModelManagerProps> = ({ onModelsUpdate }) => {
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [lmStudioConnected, setLMStudioConnected] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [lmStudioModels, setLMStudioModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const [lmStudioEndpoint, setLMStudioEndpoint] = useState('http://localhost:1234');

  // Check connections on mount
  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    setLoading(true);
    try {
      const [ollamaStatus, lmStudioStatus] = await Promise.all([
        checkOllamaConnection(ollamaEndpoint),
        checkLMStudioConnection(lmStudioEndpoint)
      ]);
      
      setOllamaConnected(ollamaStatus);
      setLMStudioConnected(lmStudioStatus);

      if (ollamaStatus) {
        await refreshOllamaModels();
      }
      if (lmStudioStatus) {
        await refreshLMStudioModels();
      }
    } catch (error) {
      console.error('Failed to check connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOllamaModels = async () => {
    try {
      const models = await fetchOllamaModels(ollamaEndpoint);
      setOllamaModels(models);
      onModelsUpdate('Ollama', models);
    } catch (error) {
      console.error('Failed to refresh Ollama models:', error);
    }
  };

  const refreshLMStudioModels = async () => {
    try {
      const models = await fetchLMStudioModels(lmStudioEndpoint);
      setLMStudioModels(models);
      onModelsUpdate('LM Studio', models);
    } catch (error) {
      console.error('Failed to refresh LM Studio models:', error);
    }
  };

  const getModelBadges = (modelName: string) => {
    const badges = [];
    
    const sizeCategory = getModelSizeCategory(modelName);
    if (sizeCategory !== 'unknown') {
      badges.push(
        <Badge key="size" variant="outline" className="text-xs">
          {sizeCategory}
        </Badge>
      );
    }
    
    if (isCodeModel(modelName)) {
      badges.push(
        <Badge key="code" variant="secondary" className="text-xs bg-blue-100 text-blue-700">
          <Cpu className="h-3 w-3 mr-1" />
          Code
        </Badge>
      );
    }
    
    if (isChatModel(modelName)) {
      badges.push(
        <Badge key="chat" variant="secondary" className="text-xs bg-green-100 text-green-700">
          Chat
        </Badge>
      );
    }
    
    return badges;
  };

  const renderModelList = (models: string[], title: string, connected: boolean) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          {title}
          {connected ? (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </h4>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={title.includes('Ollama') ? refreshOllamaModels : refreshLMStudioModels}
          disabled={!connected || loading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {!connected ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {title} is not running or not accessible. Please ensure it's installed and running.
          </AlertDescription>
        </Alert>
      ) : models.length === 0 ? (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            No models found. Please install some models in {title} first.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {models.map((model) => (
            <div 
              key={model}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {getModelDisplayName(model)}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {model}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {getModelBadges(model)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Local Model Manager
        </CardTitle>
        <CardDescription>
          Manage and configure local AI models from Ollama and LM Studio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models">Available Models</TabsTrigger>
            <TabsTrigger value="setup">Setup & Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Local Models</h3>
              <Button 
                onClick={checkConnections} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Check Connections
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {renderModelList(ollamaModels, 'Ollama Models', ollamaConnected)}
              </div>
              <div>
                {renderModelList(lmStudioModels, 'LM Studio Models', lmStudioConnected)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6 mt-4">
            <div className="space-y-6">
              {/* Ollama Setup */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Ollama Configuration
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
                    <Input
                      id="ollama-endpoint"
                      value={ollamaEndpoint}
                      onChange={(e) => setOllamaEndpoint(e.target.value)}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => checkOllamaConnection(ollamaEndpoint).then(setOllamaConnected)}
                    >
                      Test Connection
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('https://ollama.ai', '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Download Ollama
                    </Button>
                  </div>
                </div>
              </div>

              {/* LM Studio Setup */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  LM Studio Configuration
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="lmstudio-endpoint">LM Studio Endpoint</Label>
                    <Input
                      id="lmstudio-endpoint"
                      value={lmStudioEndpoint}
                      onChange={(e) => setLMStudioEndpoint(e.target.value)}
                      placeholder="http://localhost:1234"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => checkLMStudioConnection(lmStudioEndpoint).then(setLMStudioConnected)}
                    >
                      Test Connection
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('https://lmstudio.ai', '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Download LM Studio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Setup Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Ollama:</strong> Install from ollama.ai, then run `ollama pull llama2` to install a model</li>
                      <li><strong>LM Studio:</strong> Install from lmstudio.ai, download models, and start the local server</li>
                      <li>Ensure both applications are running before using them with this app</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LocalModelManager;
