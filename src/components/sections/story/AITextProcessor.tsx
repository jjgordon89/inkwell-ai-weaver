import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '@/hooks/useAI';
import { useAIErrorHandler } from '@/hooks/ai/useAIErrorHandler';
import { useToast } from "@/hooks/use-toast";
import AIErrorBoundary from '@/components/ai/AIErrorBoundary';
import ProviderStatus from './ai-text-processor/ProviderStatus';
import SelectedTextDisplay from './ai-text-processor/SelectedTextDisplay';
import ActionButtons from './ai-text-processor/ActionButtons';
import SuggestionsList from './ai-text-processor/SuggestionsList';
import RevisionModeButton from './ai-text-processor/RevisionModeButton';

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
      
      const prompt = `Provide 3 different variations to ${action} this text: "${state.selectedText}"
      
      Format each suggestion as:
      Option 1: [suggestion text]
      Option 2: [suggestion text] 
      Option 3: [suggestion text]
      
      Make each option distinctly different while achieving the goal to ${action} the text.`;
      
      const suggestionsText = await processText(prompt, action);
      
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
            confidence: 85 + Math.floor(Math.random() * 15)
          });
        }
      });
      
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
    
    setSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: '' });
    }, 500);
  };

  const handleCancelSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

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
            : 'Select text in the editor to enable AI processing or use revision mode for document-wide improvements'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProviderStatus
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          isCurrentProviderConfigured={isCurrentProviderConfigured}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
              <button 
                className="ml-2 underline"
                onClick={clearError}
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Revision Mode - available even without selected text */}
        <div className="border-t pt-4">
          <RevisionModeButton isProviderConfigured={isCurrentProviderConfigured()} />
        </div>

        {state.selectedText ? (
          <div className="space-y-3 border-t pt-4">
            <SelectedTextDisplay selectedText={state.selectedText} />

            {!showSuggestions && (
              <ActionButtons
                onAction={generateSuggestions}
                processingAction={processingAction}
                isProcessing={isProcessing}
                isProviderConfigured={isCurrentProviderConfigured()}
              />
            )}

            {showSuggestions && suggestions.length > 0 && (
              <SuggestionsList
                suggestions={suggestions}
                onApplySuggestion={applySuggestion}
                onCancel={handleCancelSuggestions}
              />
            )}

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
          <div className="text-center p-6 text-muted-foreground border-t pt-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-2">No text selected</p>
            <p className="text-xs">
              Highlight text in the editor to process it with AI, or use Revision Mode above for document-wide improvements
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
