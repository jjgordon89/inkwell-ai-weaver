import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, TestTube, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAI } from '@/hooks/useAI';
import { useLocalModels } from '@/hooks/ai/useLocalModels';

const LocalModelTester: React.FC = () => {
  const { processText, selectedProvider, selectedModel, setSelectedProvider, setSelectedModel } = useAI();
  const { state: localState, hasConnectedProvider } = useLocalModels();
  
  const [testPrompt, setTestPrompt] = useState('Write a short story about a brave knight.');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localProviders = ['Ollama', 'LM Studio'];
  const availableModels = selectedProvider === 'Ollama' 
    ? localState.ollama.models 
    : selectedProvider === 'LM Studio' 
    ? localState.lmStudio.models 
    : [];

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setResult('');
    
    try {
      const response = await processText(testPrompt, 'continue-story');
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const isConnected = selectedProvider === 'Ollama' ? localState.ollama.connected : localState.lmStudio.connected;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Local Model Tester
        </CardTitle>
        <CardDescription>
          Test your local AI models (Ollama and LM Studio) to ensure they're working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {localProviders.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    <div className="flex items-center gap-2">
                      {provider}
                      {(provider === 'Ollama' && localState.ollama.connected) ||
                       (provider === 'LM Studio' && localState.lmStudio.connected) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!isConnected}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
          {isConnected && (
            <span className="text-sm text-muted-foreground">
              {availableModels.length} models available
            </span>
          )}
        </div>

        {/* Test Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Test Prompt</Label>
          <Textarea
            id="prompt"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a prompt to test your local model..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Test Button */}
        <Button 
          onClick={handleTest} 
          disabled={!isConnected || !selectedModel || isProcessing || !testPrompt.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Test Model
            </>
          )}
        </Button>

        {/* Results */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-2">
            <Label>Result:</Label>
            <div className="p-4 bg-muted rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!hasConnectedProvider() && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No local providers connected.</strong> Please ensure that either Ollama or LM Studio is running and has models loaded.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LocalModelTester;
