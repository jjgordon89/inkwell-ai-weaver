
import { useState, useCallback } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useCollaborativeAI } from './useCollaborativeAI';
import { useToast } from '@/hooks/use-toast';

interface WorkflowAction {
  id: string;
  label: string;
  icon: string;
  action: 'improve' | 'continue' | 'summarize' | 'expand' | 'rewrite';
  priority: 'high' | 'medium' | 'low';
}

interface BatchSuggestion {
  id: string;
  text: string;
  original?: string;
  confidence: number;
  applied: boolean;
}

export const useWorkflowOptimization = () => {
  const { state, dispatch } = useWriting();
  const { improveSelectedText, generateTextCompletion } = useCollaborativeAI();
  const { toast } = useToast();
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuggestions, setBatchSuggestions] = useState<BatchSuggestion[]>([]);

  // One-click workflow actions
  const workflowActions: WorkflowAction[] = [
    { id: 'quick-improve', label: 'Quick Improve', icon: 'Wand2', action: 'improve', priority: 'high' },
    { id: 'continue-writing', label: 'Continue', icon: 'ArrowRight', action: 'continue', priority: 'high' },
    { id: 'summarize', label: 'Summarize', icon: 'FileText', action: 'summarize', priority: 'medium' },
    { id: 'expand-text', label: 'Expand', icon: 'Maximize2', action: 'expand', priority: 'medium' },
    { id: 'rewrite', label: 'Rewrite', icon: 'RotateCcw', action: 'rewrite', priority: 'low' }
  ];

  const executeOneClickAction = useCallback(async (actionId: string, selectedText?: string) => {
    const action = workflowActions.find(a => a.id === actionId);
    if (!action || !state.currentDocument) return;

    const textToProcess = selectedText || state.currentDocument.content?.slice(-200) || '';
    if (!textToProcess) return;

    try {
      let result = '';
      switch (action.action) {
        case 'improve':
          const improvement = await improveSelectedText(textToProcess);
          result = improvement?.text || '';
          break;
        case 'continue':
          result = await generateTextCompletion(textToProcess, '') || '';
          break;
        case 'summarize':
          result = `Summary: ${textToProcess.substring(0, 100)}...`;
          break;
        case 'expand':
          result = `${textToProcess} [Expanded version would go here]`;
          break;
        case 'rewrite':
          result = `[Rewritten version of: ${textToProcess.substring(0, 50)}...]`;
          break;
      }

      if (result) {
        const newContent = selectedText 
          ? state.currentDocument.content?.replace(selectedText, result) || result
          : (state.currentDocument.content || '') + '\n\n' + result;

        dispatch({
          type: 'UPDATE_DOCUMENT_CONTENT',
          payload: {
            id: state.currentDocument.id,
            content: newContent
          }
        });

        toast({
          title: `${action.label} Applied`,
          description: 'AI action completed successfully'
        });
      }
    } catch (error) {
      console.error('One-click action failed:', error);
      toast({
        title: "Action Failed",
        description: `Failed to execute ${action.label}`,
        variant: "destructive"
      });
    }
  }, [state.currentDocument, improveSelectedText, generateTextCompletion, dispatch, toast, workflowActions]);

  const batchProcessSuggestions = useCallback(async (suggestions: string[]) => {
    if (!state.currentDocument || suggestions.length === 0) return;

    setIsProcessingBatch(true);
    const batchResults: BatchSuggestion[] = [];

    try {
      for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];
        const batchItem: BatchSuggestion = {
          id: `batch-${Date.now()}-${i}`,
          text: suggestion,
          confidence: Math.floor(Math.random() * 20) + 80, // Mock confidence
          applied: false
        };
        batchResults.push(batchItem);
      }

      setBatchSuggestions(batchResults);
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${suggestions.length} suggestions`
      });
    } catch (error) {
      console.error('Batch processing failed:', error);
      toast({
        title: "Batch Processing Failed",
        description: "Failed to process suggestions in batch",
        variant: "destructive"
      });
    } finally {
      setIsProcessingBatch(false);
    }
  }, [state.currentDocument, toast]);

  const applyBatchSuggestion = useCallback((suggestionId: string) => {
    const suggestion = batchSuggestions.find(s => s.id === suggestionId);
    if (!suggestion || !state.currentDocument) return;

    const newContent = (state.currentDocument.content || '') + '\n\n[AI Suggestion: ' + suggestion.text + ']';
    
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: state.currentDocument.id,
        content: newContent
      }
    });

    setBatchSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, applied: true } : s)
    );

    toast({
      title: "Suggestion Applied",
      description: "Batch suggestion added to document"
    });
  }, [batchSuggestions, state.currentDocument, dispatch, toast]);

  const getContextAwareActions = useCallback(() => {
    if (!state.currentDocument) return workflowActions;

    const content = state.currentDocument.content || '';
    const wordCount = content.split(' ').length;
    
    // Context-aware filtering
    if (wordCount < 50) {
      return workflowActions.filter(a => ['continue-writing', 'expand-text'].includes(a.id));
    } else if (wordCount > 1000) {
      return workflowActions.filter(a => ['summarize', 'quick-improve'].includes(a.id));
    }
    
    return workflowActions.filter(a => a.priority === 'high' || a.priority === 'medium');
  }, [state.currentDocument, workflowActions]);

  return {
    workflowActions,
    batchSuggestions,
    isProcessingBatch,
    executeOneClickAction,
    batchProcessSuggestions,
    applyBatchSuggestion,
    getContextAwareActions
  };
};
