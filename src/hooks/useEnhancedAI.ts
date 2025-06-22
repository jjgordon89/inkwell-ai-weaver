
import { useContextualSuggestions } from './ai/useContextualSuggestions';
import { useToneAnalysis } from './ai/useToneAnalysis';
import { useStoryGeneration } from './ai/useStoryGeneration';
import { useWritingPrompts } from './ai/useWritingPrompts';

export const useEnhancedAI = () => {
  const contextualSuggestions = useContextualSuggestions();
  const toneAnalysis = useToneAnalysis();
  const storyGeneration = useStoryGeneration();
  const writingPrompts = useWritingPrompts();

  return {
    // Context-aware suggestions
    generateContextualSuggestions: contextualSuggestions.generateContextualSuggestions,
    
    // Analysis tools
    analyzeToneAndStyle: toneAnalysis.analyzeToneAndStyle,
    analyzeWritingQuality: toneAnalysis.analyzeWritingQuality,
    
    // Plot development
    generatePlotElements: storyGeneration.generatePlotElements,
    continueStory: storyGeneration.continueStory,
    
    // Writing exercises
    generateWritingPrompt: writingPrompts.generateWritingPrompt,
    predictNextWords: writingPrompts.predictNextWords,
    
    // State
    isAnalyzing: contextualSuggestions.isAnalyzing || toneAnalysis.isAnalyzing,
    isGenerating: storyGeneration.isGenerating || writingPrompts.isGenerating
  };
};
