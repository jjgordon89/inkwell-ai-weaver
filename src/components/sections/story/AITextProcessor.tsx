
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Wand2, Zap, CheckCircle, AlertCircle, Key, Settings } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '@/hooks/useAI';

const AITextProcessor = () => {
  const { state, dispatch } = useWriting();
  const { 
    processText, 
    isProcessing, 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured 
  } = useAI();
  
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextImprovement = async (action: 'improve' | 'shorten' | 'expand' | 'fix-grammar') => {
    if (!state.selectedText || !state.currentDocument) return;

    // Clear any previous errors
    setError(null);
    setProcessingAction(action);
    
    try {
      console.log(`Starting ${action} action with text: "${state.selectedText.substring(0, 50)}..."`);
      
      const improvedText = await processText(state.selectedText, action);
      
      // Replace selected text in the document
      const newContent = state.currentDocument.content.replace(
        state.selectedText,
        improvedText
      );
      
      dispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: state.currentDocument.id,
          content: newContent
        }
      });
      
      setLastAction(action);
      
      // Clear selection after a brief delay
      setTimeout(() => {
        dispatch({ type: 'SET_SELECTED_TEXT', payload: '' });
      }, 500);
      
      console.log(`✅ Successfully completed ${action} action`);
    } catch (error) {
      console.error(`❌ AI processing failed for ${action}:`, error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setProcessingAction(null);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'improve': return <Wand2 className="h-4 w-4" />;
      case 'shorten': return <Zap className="h-4 w-4" />;
      case 'expand': return <Lightbulb className="h-4 w-4" />;
      case 'fix-grammar': return <CheckCircle className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'improve': return 'Enhance clarity and flow';
      case 'shorten': return 'Make more concise';
      case 'expand': return 'Add detail and depth';
      case 'fix-grammar': return 'Correct grammar and style';
      default: return '';
    }
  };

  const actions = [
    { action: 'improve', label: 'Improve' },
    { action: 'shorten', label: 'Shorten' },
    { action: 'expand', label: 'Expand' },
    { action: 'fix-grammar', label: 'Fix Grammar' }
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Text Processing
        </CardTitle>
        <CardDescription>
          {state.selectedText 
            ? `Process "${state.selectedText.substring(0, 30)}${state.selectedText.length > 30 ? '...' : ''}"`
            : 'Select text in the editor to enable AI processing'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Status */}
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

        {/* Configuration Warning */}
        {!isCurrentProviderConfigured() && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Please configure your {selectedProvider} API key in the AI Assistance settings to use text processing features.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {state.selectedText ? (
          <div className="space-y-3">
            {/* Selected Text Display */}
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm font-medium mb-1">Selected Text:</p>
              <p className="text-sm text-muted-foreground italic">
                "{state.selectedText.substring(0, 100)}{state.selectedText.length > 100 ? '...' : ''}"
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {state.selectedText.split(' ').length} words
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {state.selectedText.length} characters
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {actions.map(({ action, label }) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTextImprovement(action)}
                  disabled={isProcessing || !isCurrentProviderConfigured()}
                  className="flex items-center gap-2"
                  title={!isCurrentProviderConfigured() ? 'Configure API key first' : getActionDescription(action)}
                >
                  {processingAction === action ? (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    getActionIcon(action)
                  )}
                  {processingAction === action ? 'Processing...' : label}
                </Button>
              ))}
            </div>

            {/* Success Message */}
            {lastAction && !error && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Text {lastAction === 'fix-grammar' ? 'grammar fixed' : `${lastAction}d`} successfully
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-2">No text selected</p>
            <p className="text-xs">
              Highlight text in the editor to process it with AI
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITextProcessor;
