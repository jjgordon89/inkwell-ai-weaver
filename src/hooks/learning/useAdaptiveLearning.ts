import { useAdaptiveLearningCore } from './useAdaptiveLearningCore';

// Re-export the core functionality with the same interface for backwards compatibility
export const useAdaptiveLearning = () => {
  const core = useAdaptiveLearningCore();

  return {
    // Keep the same interface but delegate to the refactored core
    preferences: [], // Deprecated - use getStats instead
    writingPatterns: [], // Deprecated - use getStats instead
    suggestionHistory: [], // Deprecated - use getStats instead
    isLearning: core.isLearning,
    analyzeWritingStyle: core.analyzeWritingStyle,
    recordSuggestionFeedback: core.recordFeedback,
    getPersonalizedSuggestions: core.getPersonalizedSuggestions,
    getAdaptiveSettings: core.getAdaptiveSettings,
    updatePreference: core.updatePreference,
    
    // Enhanced functionality
    currentGenre: core.currentGenre,
    genreHistory: core.genreHistory,
    generatePersonalizedCompletions: core.generatePersonalizedCompletions,
    recordCompletionUsage: core.recordCompletionUsage,
    getEnhancedStats: core.getStats,
    
    // New method name for consistency
    getStats: core.getStats,
    
    // Direct access to sub-features (kept for compatibility)
    detectGenre: () => Promise.resolve({ primaryGenre: 'general', confidence: 0, allScores: [], detectedElements: [] }),
    getGenreSpecificSuggestions: () => []
  };
};

// Re-export types for backwards compatibility
export type { UserPreference } from './useUserPreferences';
export type { SuggestionFeedback } from './useFeedbackSystem';
export type { StyleMetrics } from './useWritingStyleAnalysis';
