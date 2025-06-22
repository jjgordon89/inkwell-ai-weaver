
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
  
  const [metrics, setMetrics] = useState<WritingMetrics | null>(null);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [nextWordPredictions, setNextWordPredictions] = useState<string[]>([]);

  const analyzeText = async () => {
    if (!state.currentDocument?.content) return;
    
    try {
      const result = await analyzeWritingQuality(state.currentDocument.content);
      setMetrics(result);
      toast({
        title: "Analysis Complete",
        description: `Text analyzed with ${result.readability.level.toLowerCase()} readability.`,
      });
    } catch (error) {
      console.error("Failed to analyze text:", error);
      toast({
        title: "Error",
        description: "Failed to analyze writing quality.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAutoSuggestions = async () => {
    if (!state.currentDocument?.content) return;
    try {
      const suggestions = await generateContextualSuggestions(state.currentDocument.content);
      setAutoSuggestions(suggestions);
      if (suggestions.length > 0) {
        toast({ title: "Suggestions refreshed!" });
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions.",
        variant: "destructive",
      });
    }
  };

  const handlePredictNextWords = async () => {
    if (!state.currentDocument?.content) return;
    try {
      const words = await predictNextWords(state.currentDocument.content);
      setNextWordPredictions(words);
      if (words.length > 0) {
        toast({ title: "Next word predictions updated." });
      }
    } catch(error) {
      console.error("Failed to predict next words:", error);
      toast({
        title: "Error",
        description: "Failed to predict next words.",
        variant: "destructive",
      });
    }
  };

  const handleGrammarCheck = async () => {
    if (!state.currentDocument || !state.currentDocument.content) return;
    const originalContent = state.currentDocument.content;
    toast({ title: "Checking grammar..." });
    try {
      const fixedContent = await processText(originalContent, 'fix-grammar');
      if (fixedContent !== originalContent) {
        dispatch({ 
            type: 'UPDATE_DOCUMENT_CONTENT', 
            payload: { id: state.currentDocument.id, content: fixedContent }
        });
        toast({
            title: "Grammar Check Complete",
            description: "Grammar and spelling have been corrected.",
        });
      } else {
        toast({
            title: "Grammar Check Complete",
            description: "No errors found.",
        });
      }
    } catch(error) {
      console.error("Grammar check failed:", error);
      toast({
        title: "Error",
        description: "Failed to perform grammar check.",
        variant: "destructive",
      });
    }
  };

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
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="assistance">Writing Aid</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <WritingAnalysisTab
              onAnalyze={analyzeText}
              isAnalyzing={isAnalyzing}
              hasContent={!!state.currentDocument?.content}
              metrics={metrics}
            />
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <SmartSuggestionsTab
              suggestions={autoSuggestions}
              onRefresh={handleGenerateAutoSuggestions}
              isGenerating={isGenerating}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>

          <TabsContent value="assistance" className="space-y-4">
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
