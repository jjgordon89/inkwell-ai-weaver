
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, CheckCircle, AlertCircle } from 'lucide-react';

interface TestAIConfigurationProps {
  processText: (text: string, action: 'improve' | 'shorten' | 'expand' | 'fix-grammar') => Promise<string>;
  isProcessing: boolean;
  isCurrentProviderConfigured: () => boolean;
}

const TestAIConfiguration = ({
  processText,
  isProcessing,
  isCurrentProviderConfigured
}: TestAIConfigurationProps) => {
  const [testText, setTestText] = useState('This is a sample text to test the AI functionality.');
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

  return (
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
  );
};

export default TestAIConfiguration;
