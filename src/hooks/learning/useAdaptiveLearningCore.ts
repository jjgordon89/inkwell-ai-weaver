
import { useCallback } from 'react';
import { useWritingStyleAnalysis } from './useWritingStyleAnalysis';
import { useUserPreferences } from './useUserPreferences';
import { useFeedbackSystem } from './useFeedbackSystem';
import { useGenreDetection } from './useGenreDetection';
import { usePersonalizedCompletion } from './usePersonalizedCompletion';

export const useAdaptiveLearningCore = () => {
  const { analyzeStyle, getStyleSuggestions, isAnalyzing: isAnalyzingStyle } = useWritingStyleAnalysis();
  const { preferences, updatePreference, getPreferencesByCategory } = useUserPreferences();
  const { recordFeedback, getFeedbackStats } = useFeedbackSystem();
  const { 
    detectGenre, 
    getGenreSpecificSuggestions, 
    getDominantGenre, 
    genreHistory, 
    isAnalyzing: isAnalyzingGenre 
  } = useGenreDetection();
  const { 
    generatePersonalizedCompletions, 
    learnFromText, 
    recordCompletionUsage, 
    getCompletionStats,
    isLearning: isLearningCompletions
  } = usePersonalizedCompletion();

  const analyzeWritingStyle = useCallback(async (text: string) => {
    if (!text || text.trim().length < 100) return;

    try {
      // Detect genre and analyze style in parallel
      const [genreAnalysis, styleMetrics] = await Promise.all([
        detectGenre(text),
        analyzeStyle(text)
      ]);

      // Update genre preference
      if (genreAnalysis) {
        updatePreference('genre', 'detected', genreAnalysis.primaryGenre, genreAnalysis.confidence);
      }

      // Update style preferences
      if (styleMetrics) {
        updatePreference('style', 'sentence-length', styleMetrics.sentenceLength, 0.7);
        updatePreference('style', 'vocabulary', styleMetrics.vocabularyComplexity, 0.6);
        updatePreference('style', 'dialogue-frequency', styleMetrics.dialogueFrequency, 0.8);
      }

      // Learn completion patterns
      if (genreAnalysis) {
        await learnFromText(text, genreAnalysis.primaryGenre);
      }
    } catch (error) {
      console.error('Failed to analyze writing style:', error);
    }
  }, [detectGenre, analyzeStyle, updatePreference, learnFromText]);

  const getPersonalizedSuggestions = useCallback((suggestionType: string = 'general'): string[] => {
    const currentGenre = getDominantGenre();
    const genreSuggestions = getGenreSpecificSuggestions(currentGenre);
    
    const stylePrefs = getPreferencesByCategory('style');
    const styleSuggestions: string[] = [];
    
    stylePrefs.forEach(pref => {
      if (pref.confidence > 0.5) {
        if (pref.key === 'sentence-length' && pref.value === 'short') {
          styleSuggestions.push('Your concise style works well - maintain this rhythm');
        } else if (pref.key === 'dialogue-frequency' && pref.value === 'high') {
          styleSuggestions.push('Balance your dialogue with action and description');
        }
      }
    });

    // Filter based on feedback history
    const feedbackStats = getFeedbackStats();
    const allSuggestions = [...genreSuggestions, ...styleSuggestions];
    
    return allSuggestions.slice(0, 5);
  }, [getDominantGenre, getGenreSpecificSuggestions, getPreferencesByCategory, getFeedbackStats]);

  const getAdaptiveSettings = useCallback(() => {
    const assistancePrefs = getPreferencesByCategory('assistance');
    const feedbackStats = getFeedbackStats();
    
    const assistanceIntensity = Math.max(0.1, Math.min(1.0, 
      feedbackStats.acceptanceRate * 1.2 + 0.3
    ));

    return {
      assistanceIntensity,
      suggestionFrequency: assistanceIntensity,
      autoSuggestionsEnabled: assistanceIntensity > 0.3,
      proactiveSuggestionsEnabled: assistanceIntensity > 0.6,
      currentGenre: getDominantGenre(),
      genreConfidence: genreHistory[0]?.confidence || 0
    };
  }, [getPreferencesByCategory, getFeedbackStats, getDominantGenre, genreHistory]);

  const getStats = useCallback(() => {
    const completionStats = getCompletionStats();
    const feedbackStats = getFeedbackStats();
    
    return {
      preferences: preferences.length,
      genreHistory: genreHistory.slice(0, 5),
      completionPatterns: completionStats.totalPatterns,
      genreBreakdown: completionStats.genreBreakdown,
      feedbackStats,
      isLearning: isAnalyzingStyle || isAnalyzingGenre || isLearningCompletions,
      currentGenre: getDominantGenre()
    };
  }, [preferences, genreHistory, getCompletionStats, getFeedbackStats, isAnalyzingStyle, isAnalyzingGenre, isLearningCompletions, getDominantGenre]);

  return {
    // Core functions
    analyzeWritingStyle,
    getPersonalizedSuggestions,
    getAdaptiveSettings,
    getStats,
    
    // Sub-system access
    updatePreference,
    recordFeedback: recordFeedback,
    generatePersonalizedCompletions,
    recordCompletionUsage,
    
    // State
    isLearning: isAnalyzingStyle || isAnalyzingGenre || isLearningCompletions,
    currentGenre: getDominantGenre(),
    genreHistory
  };
};
