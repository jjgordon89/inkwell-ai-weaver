
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2 } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { useToast } from "@/hooks/use-toast";
import { ToneAnalysis, PlotElement, WritingPrompt } from '@/hooks/ai/types';
import ContextSuggestionsTab from './enhanced-ai/ContextSuggestionsTab';
import ToneAnalysisTab from './enhanced-ai/ToneAnalysisTab';
import PlotDevelopmentTab from './enhanced-ai/PlotDevelopmentTab';
import WritingPromptsTab from './enhanced-ai/WritingPromptsTab';
import { applySuggestionAsNote, applyStoryContinuation } from './enhanced-ai/enhancedAIUtils';
import { ENHANCED_AI_TABS, ENHANCED_AI_DEFAULTS } from './enhanced-ai/constants';

const EnhancedAIPanel = () => {
  const { state, dispatch } = useWriting();
  const { 
    generateContextualSuggestions,
    analyzeToneAndStyle,
    generatePlotElements,
    continueStory,
    generateWritingPrompt,
    isAnalyzing,
    isGenerating
  } = useEnhancedAI();
  
  const { toast } = useToast();
  
  const [contextSuggestions, setContextSuggestions] = useState<string[]>(ENHANCED_AI_DEFAULTS.CONTEXT_SUGGESTIONS);
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(ENHANCED_AI_DEFAULTS.TONE_ANALYSIS);
  const [plotElements, setPlotElements] = useState<PlotElement[]>(ENHANCED_AI_DEFAULTS.PLOT_ELEMENTS);
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>(ENHANCED_AI_DEFAULTS.WRITING_PROMPTS);
  const [storyContinuation, setStoryContinuation] = useState<string>(ENHANCED_AI_DEFAULTS.STORY_CONTINUATION);

  const handleContextSuggestions = async () => {
    if (!state.currentDocument) return;
    
    try {
      const suggestions = await generateContextualSuggestions(
        state.currentDocument.content,
        state.selectedText,
        state.characters,
        state.storyArcs
      );
      setContextSuggestions(suggestions);
      toast({
        title: "Context Analysis Complete",
        description: `Generated ${suggestions.length} contextual suggestions`,
      });
    } catch (error) {
      console.error('Failed to generate contextual suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate contextual suggestions.",
        variant: "destructive",
      });
    }
  };

  const handleToneAnalysis = async () => {
    const textToAnalyze = state.selectedText || state.currentDocument?.content;
    if (!textToAnalyze) return;
    
    try {
      const analysis = await analyzeToneAndStyle(textToAnalyze);
      setToneAnalysis(analysis);
      toast({
        title: "Tone Analysis Complete",
        description: `Detected ${analysis.tone} tone with ${analysis.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Failed to analyze tone:', error);
      toast({
        title: "Error",
        description: "Failed to analyze tone and style.",
        variant: "destructive",
      });
    }
  };

  const handlePlotGeneration = async () => {
    if (!state.currentDocument) return;
    
    try {
      const elements = await generatePlotElements(state.currentDocument.content);
      setPlotElements(elements);
      toast({
        title: "Plot Elements Generated",
        description: `Created ${elements.length} plot suggestions`,
      });
    } catch (error) {
      console.error('Failed to generate plot elements:', error);
      toast({
        title: "Error",
        description: "Failed to generate plot elements.",
        variant: "destructive",
      });
    }
  };

  const handleStoryContinuation = async () => {
    if (!state.currentDocument) return;
    
    try {
      const continuation = await continueStory(state.currentDocument.content);
      setStoryContinuation(continuation);
      toast({
        title: "Story Continuation Generated",
        description: "AI has generated a continuation for your story",
      });
    } catch (error) {
      console.error('Failed to continue story:', error);
      toast({
        title: "Error",
        description: "Failed to generate story continuation.",
        variant: "destructive",
      });
    }
  };

  const handleWritingPrompt = async () => {
    try {
      const prompt = await generateWritingPrompt('fiction', 'intermediate', 'theme');
      setWritingPrompts(prev => [prompt, ...prev].slice(0, 5));
      toast({
        title: "Writing Prompt Generated",
        description: `Created "${prompt.title}" writing exercise`,
      });
    } catch (error) {
      console.error('Failed to generate writing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate writing prompt.",
        variant: "destructive",
      });
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    applySuggestionAsNote(suggestion, state.currentDocument, dispatch, toast);
  };

  const handleApplyContinuation = () => {
    applyStoryContinuation(storyContinuation, state.currentDocument, dispatch, toast, () => setStoryContinuation(''));
  };

  const isProcessing = isAnalyzing || isGenerating;
  const hasDocument = !!state.currentDocument;
  const hasContent = !!(state.selectedText || state.currentDocument?.content);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Enhanced AI Writing Tools
        </CardTitle>
        <CardDescription>
          Advanced AI capabilities for contextual writing assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={ENHANCED_AI_TABS.CONTEXT} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value={ENHANCED_AI_TABS.CONTEXT}>Context</TabsTrigger>
            <TabsTrigger value={ENHANCED_AI_TABS.ANALYSIS}>Analysis</TabsTrigger>
            <TabsTrigger value={ENHANCED_AI_TABS.PLOT}>Plot</TabsTrigger>
            <TabsTrigger value={ENHANCED_AI_TABS.PROMPTS}>Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value={ENHANCED_AI_TABS.CONTEXT} className="space-y-4">
            <ContextSuggestionsTab
              suggestions={contextSuggestions}
              onGenerateSuggestions={handleContextSuggestions}
              onApplySuggestion={handleApplySuggestion}
              isProcessing={isProcessing}
              hasDocument={hasDocument}
            />
          </TabsContent>

          <TabsContent value={ENHANCED_AI_TABS.ANALYSIS} className="space-y-4">
            <ToneAnalysisTab
              toneAnalysis={toneAnalysis}
              onAnalyzeTone={handleToneAnalysis}
              onApplySuggestion={handleApplySuggestion}
              isProcessing={isProcessing}
              hasContent={hasContent}
            />
          </TabsContent>

          <TabsContent value={ENHANCED_AI_TABS.PLOT} className="space-y-4">
            <PlotDevelopmentTab
              plotElements={plotElements}
              storyContinuation={storyContinuation}
              onGeneratePlotElements={handlePlotGeneration}
              onGenerateStoryContinuation={handleStoryContinuation}
              onApplySuggestion={handleApplySuggestion}
              onApplyContinuation={handleApplyContinuation}
              isProcessing={isProcessing}
              hasDocument={hasDocument}
            />
          </TabsContent>

          <TabsContent value={ENHANCED_AI_TABS.PROMPTS} className="space-y-4">
            <WritingPromptsTab
              writingPrompts={writingPrompts}
              onGeneratePrompt={handleWritingPrompt}
              onApplySuggestion={handleApplySuggestion}
              isProcessing={isProcessing}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIPanel;
