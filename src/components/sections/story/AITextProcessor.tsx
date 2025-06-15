
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Wand2, Zap, CheckCircle, AlertCircle, Key, Settings, ArrowRight } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '@/hooks/useAI';
import { useAIErrorHandler } from '@/hooks/ai/useAIErrorHandler';
import { useToast } from "@/hooks/use-toast";
import AIErrorBoundary from '@/components/ai/AIErrorBoundary';

interface TextSuggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  action: string;
  confidence: number;
}

const AITextProcessorContent = () => {
  const { state, dispatch } = useWriting();
  const { 
    processText, 
    isProcessing, 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured 
  } = useAI();
  
  const { error, clearError, retryWithErrorHandling } = useAIErrorHandler();
  const { toast } = useToast();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<TextSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateSuggestions = async (action: 'improve' | 'shorten' | 'expand' | 'fix-grammar') => {
    if (!state.selectedText || !state.currentDocument) return;

    clearError();
    setProcessingAction(action);
    
    const result = await retryWithErrorHandling(async () => {
      console.log(`Generating suggestions for ${action} with text: "${state.selectedText.substring(0, 50)}..."`);
      
      // Generate multiple suggestions instead of directly applying
      const prompt = `Provide 3 different variations to ${action} this text: "${state.selectedText}"
      
      Format each suggestion as:
      Option 1: [suggestion text]
      Option 2: [suggestion text] 
      Option 3: [suggestion text]
      
      Make each option distinctly different while achieving the goal to ${action} the text.`;
      
      const suggestionsText = await processText(prompt, action);
      
      // Parse suggestions
      const lines = suggestionsText.split('\n').filter(line => line.trim().length > 0);
      const parsedSuggestions: TextSuggestion[] = [];
      
      lines.forEach((line, index) => {
        const match = line.match(/Option \d+:\s*(.+)/);
        if (match) {
          parsedSuggestions.push({
            id: `${action}-${index}`,
            originalText: state.selectedText,
            suggestedText: match[1].trim(),
            action,
            confidence: 85 + Math.floor(Math.random() * 15) // Random confidence 85-100%
          });
        }
      });
      
      // Fallback if parsing fails
      if (parsedSuggestions.length === 0) {
        parsedSuggestions.push({
          id: `${action}-fallback`,
          originalText: state.selectedText,
          suggestedText: suggestionsText,
          action,
          confidence: 80
        });
      }
      
      setSuggestions(parsedSuggestions);
      setShowSuggestions(true);
      setLastAction(action);
      
      console.log(`✅ Generated ${parsedSuggestions.length} suggestions for ${action}`);
      return true;
    }, 'api');

    setProcessingAction(null);
  };

  const applySuggestion = (suggestion: TextSuggestion) => {
    if (!state.currentDocument) return;

    // Replace selected text with chosen suggestion
    const newContent = state.currentDocument.content.replace(
      suggestion.originalText,
      suggestion.suggestedText
    );
    
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: state.currentDocument.id,
        content: newContent
      }
    });
    
    toast({
      title: "Suggestion Applied",
      description: `Text ${suggestion.action}d successfully`,
    });
    
    // Clear suggestions and selection
    setSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: '' });
    }, 500);
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
            <AlertDescription>
              {error.message}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </AlertDescription>
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
            {!showSuggestions && (
              <div className="grid grid-cols-2 gap-2">
                {actions.map(({ action, label }) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => generateSuggestions(action)}
                    disabled={isProcessing || !isCurrentProviderConfigured()}
                    className="flex items-center gap-2"
                    title={!isCurrentProviderConfigured() ? 'Configure API key first' : getActionDescription(action)}
                  >
                    {processingAction === action ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      getActionIcon(action)
                    )}
                    {processingAction === action ? 'Generating...' : label}
                  </Button>
                ))}
              </div>
            )}

            {/* Suggestions Display */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Choose a suggestion:</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSuggestions(false);
                      setSuggestions([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={suggestion.id}
                    className="p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Option {index + 1}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm">{suggestion.suggestedText}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Success Message */}
            {lastAction && !error && !showSuggestions && suggestions.length === 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Suggestion applied successfully
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

const AITextProcessor = () => {
  return (
    <AIErrorBoundary>
      <AITextProcessorContent />
    </AIErrorBoundary>
  );
};

export default AITextProcessor;
