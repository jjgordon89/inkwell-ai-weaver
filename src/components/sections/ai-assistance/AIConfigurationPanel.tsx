
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, TestTube, Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIConfigurationPanel = () => {
  const { 
    processText, 
    isProcessing, 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured 
  } = useAI();
  
  const [testText, setTestText] = useState('This is a sample text to test the AI functionality.');
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [realTimeProcessing, setRealTimeProcessing] = useState(false);
  const [maxTokens, setMaxTokens] = useState('1000');
  const [temperature, setTemperature] = useState('0.7');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestAI = async () => {
    if (!testText.trim()) return;
    
    setTestResult(null);
    setTestError(null);
    
    try {
      console.log('Testing AI configuration...');
      const result = await processText(testText, 'improve');
      setTestResult(result);
      setTestText(result);
    } catch (error) {
      console.error('AI test failed:', error);
      setTestError(error instanceof Error ? error.message : 'Test failed');
    }
  };

  const resetSettings = () => {
    setAutoSuggest(true);
    setRealTimeProcessing(false);
    setMaxTokens('1000');
    setTemperature('0.7');
    setTestText('This is a sample text to test the AI functionality.');
    setTestResult(null);
    setTestError(null);
  };

  const saveSettings = () => {
    // Save settings to localStorage
    const settings = {
      autoSuggest,
      realTimeProcessing,
      maxTokens,
      temperature
    };
    localStorage.setItem('ai-configuration', JSON.stringify(settings));
    console.log('AI configuration saved:', settings);
  };

  // Load settings on component mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-configuration');
      if (saved) {
        const settings = JSON.parse(saved);
        setAutoSuggest(settings.autoSuggest ?? true);
        setRealTimeProcessing(settings.realTimeProcessing ?? false);
        setMaxTokens(settings.maxTokens ?? '1000');
        setTemperature(settings.temperature ?? '0.7');
      }
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
    }
  }, []);

  const isValidTemperature = () => {
    const temp = parseFloat(temperature);
    return !isNaN(temp) && temp >= 0 && temp <= 2;
  };

  const isValidMaxTokens = () => {
    const tokens = parseInt(maxTokens);
    return !isNaN(tokens) && tokens > 0 && tokens <= 10000;
  };

  return (
    <div className="space-y-4">
      {/* Current Configuration Status */}
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

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure how AI assistance behaves in your writing workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-suggest">Auto Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically show suggestions when text is selected
              </p>
            </div>
            <Switch
              id="auto-suggest"
              checked={autoSuggest}
              onCheckedChange={setAutoSuggest}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="real-time">Real-time Processing</Label>
              <p className="text-sm text-muted-foreground">
                Process text as you type (experimental)
              </p>
            </div>
            <Switch
              id="real-time"
              checked={realTimeProcessing}
              onCheckedChange={setRealTimeProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Parameters</CardTitle>
          <CardDescription>
            Fine-tune AI model behavior for your specific needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                placeholder="1000"
                className={!isValidMaxTokens() ? "border-red-500" : ""}
              />
              {!isValidMaxTokens() && (
                <p className="text-xs text-red-500">Must be between 1 and 10,000</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="0.7"
                className={!isValidTemperature() ? "border-red-500" : ""}
              />
              {!isValidTemperature() && (
                <p className="text-xs text-red-500">Must be between 0.0 and 2.0</p>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Max Tokens: Maximum length of AI responses (1-10,000)</p>
            <p>• Temperature: Controls creativity (0 = focused, 2 = creative)</p>
          </div>
        </CardContent>
      </Card>

      {/* Test AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test AI Configuration
          </CardTitle>
          <CardDescription>
            Test your current AI settings with sample text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-text">Test Text</Label>
            <Input
              id="test-text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test AI processing..."
            />
          </div>
          
          {testError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testError}</AlertDescription>
            </Alert>
          )}
          
          {testResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Test completed successfully! The AI processed your text.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestAI} 
              disabled={isProcessing || !testText.trim() || !isCurrentProviderConfigured()}
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isProcessing ? 'Testing...' : 'Test AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetSettings} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default AIConfigurationPanel;
