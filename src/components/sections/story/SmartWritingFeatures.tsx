
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { useAI } from '@/hooks/useAI';
import { WritingMetrics } from '@/hooks/ai/types';
import WritingAnalysisTab from './smart-writing/WritingAnalysisTab';
import SmartSuggestionsTab from './smart-writing/SmartSuggestionsTab';
import WritingAssistanceTab from './smart-writing/WritingAssistanceTab';
import { 
  SMART_WRITING_DEFAULTS, 
  TAB_CONFIG 
} from './smart-writing/constants';
import {
  createAnalyzeHandler,
  createSuggestionsHandler,
  createPredictWordsHandler,
  createGrammarCheckHandler
} from './smart-writing/smartWritingUtils';

const SmartWritingFeatures = () => {
  const { state, dispatch } = useWriting();
  const { toast } = useToast();
  const { 
    analyzeWritingQuality, 
    generateContextualSuggestions,
    predictNextWords,
    isAnalyzing, 
    isGenerating 
  } = useEnhancedAI();
  const { processText, isProcessing: isAIToolProcessing } = useAI();
  
  const [metrics, setMetrics] = useState<WritingMetrics | null>(SMART_WRITING_DEFAULTS.METRICS);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>(SMART_WRITING_DEFAULTS.AUTO_SUGGESTIONS);
  const [nextWordPredictions, setNextWordPredictions] = useState<string[]>(SMART_WRITING_DEFAULTS.NEXT_WORD_PREDICTIONS);

  // Create handlers using utility functions
  const analyzeText = createAnalyzeHandler(
    analyzeWritingQuality,
    state.currentDocument?.content,
    setMetrics,
    toast
  );

  const handleGenerateAutoSuggestions = createSuggestionsHandler(
    generateContextualSuggestions,
    state.currentDocument?.content,
    setAutoSuggestions,
    toast
  );

  const handlePredictNextWords = createPredictWordsHandler(
    predictNextWords,
    state.currentDocument?.content,
    setNextWordPredictions,
    toast
  );

  const handleGrammarCheck = createGrammarCheckHandler(
    processText,
    state.currentDocument,
    dispatch,
    toast
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Smart Writing Features
        </CardTitle>
        <CardDescription>
          Intelligent analysis and suggestions for your writing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={TAB_CONFIG.DEFAULT_TAB} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={TAB_CONFIG.TABS.ANALYSIS}>Analysis</TabsTrigger>
            <TabsTrigger value={TAB_CONFIG.TABS.SUGGESTIONS}>Smart Suggestions</TabsTrigger>
            <TabsTrigger value={TAB_CONFIG.TABS.ASSISTANCE}>Writing Aid</TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_CONFIG.TABS.ANALYSIS} className="space-y-4">
            <WritingAnalysisTab
              onAnalyze={analyzeText}
              isAnalyzing={isAnalyzing}
              hasContent={!!state.currentDocument?.content}
              metrics={metrics}
            />
          </TabsContent>

          <TabsContent value={TAB_CONFIG.TABS.SUGGESTIONS} className="space-y-4">
            <SmartSuggestionsTab
              suggestions={autoSuggestions}
              onRefresh={handleGenerateAutoSuggestions}
              isGenerating={isGenerating}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>

          <TabsContent value={TAB_CONFIG.TABS.ASSISTANCE} className="space-y-4">
            <WritingAssistanceTab
              nextWordPredictions={nextWordPredictions}
              onPredictWords={handlePredictNextWords}
              onGrammarCheck={handleGrammarCheck}
              isGenerating={isGenerating}
              isAnalyzing={isAnalyzing}
              isAIProcessing={isAIToolProcessing}
              hasContent={!!state.currentDocument?.content}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartWritingFeatures;
