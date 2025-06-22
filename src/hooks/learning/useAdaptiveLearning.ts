import { useState, useEffect, useCallback } from 'react';
import { useGenreDetection } from './useGenreDetection';
import { usePersonalizedCompletion } from './usePersonalizedCompletion';

export interface UserPreference {
  id: string;
  category: 'style' | 'genre' | 'assistance' | 'frequency';
  key: string;
  value: any;
  confidence: number;
  updatedAt: Date;
}

export interface WritingPattern {
  id: string;
  pattern: string;
  frequency: number;
  context: string;
  genre: string;
  lastSeen: Date;
}

export interface SuggestionFeedback {
  suggestionId: string;
  action: 'accepted' | 'rejected' | 'modified';
  suggestionType: string;
  context: string;
  timestamp: Date;
}

export const useAdaptiveLearning = () => {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [writingPatterns, setWritingPatterns] = useState<WritingPattern[]>([]);
  const [suggestionHistory, setSuggestionHistory] = useState<SuggestionFeedback[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<string>('general');

  // Integration with new features
  const {
    detectGenre,
    getGenreSpecificSuggestions,
    getDominantGenre,
    genreHistory,
    isAnalyzing: isAnalyzingGenre
  } = useGenreDetection();

  const {
    learnFromText: learnCompletionPatterns,
    generatePersonalizedCompletions,
    recordCompletionUsage,
    getCompletionStats,
    isLearning: isLearningCompletions
  } = usePersonalizedCompletion();

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('writing-preferences');
    const savedPatterns = localStorage.getItem('writing-patterns');
    const savedHistory = localStorage.getItem('suggestion-history');

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
    if (savedPatterns) {
      setWritingPatterns(JSON.parse(savedPatterns));
    }
    if (savedHistory) {
      setSuggestionHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('writing-preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('writing-patterns', JSON.stringify(writingPatterns));
  }, [writingPatterns]);

  useEffect(() => {
    localStorage.setItem('suggestion-history', JSON.stringify(suggestionHistory));
  }, [suggestionHistory]);

  // Update current genre based on analysis
  useEffect(() => {
    const dominant = getDominantGenre();
    setCurrentGenre(dominant);
  }, [getDominantGenre]);

  const analyzeWritingStyle = useCallback(async (text: string) => {
    if (!text || text.trim().length < 100) return;

    setIsLearning(true);
    
    try {
      // Detect genre first
      const genreAnalysis = await detectGenre(text);
      setCurrentGenre(genreAnalysis.primaryGenre);
      
      // Update genre preference
      updatePreference('genre', 'detected', genreAnalysis.primaryGenre, genreAnalysis.confidence);
      
      // Learn completion patterns for this genre
      await learnCompletionPatterns(text, genreAnalysis.primaryGenre);
      
      // Analyze sentence length patterns
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(' ').length, 0) / sentences.length;
      
      updatePreference('style', 'sentence-length', avgSentenceLength > 20 ? 'long' : avgSentenceLength > 12 ? 'medium' : 'short', 0.7);
      
      // Analyze vocabulary complexity
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const complexWords = words.filter(word => word.length > 8).length;
      const vocabularyComplexity = complexWords / words.length;
      
      updatePreference('style', 'vocabulary', vocabularyComplexity > 0.15 ? 'complex' : vocabularyComplexity > 0.08 ? 'moderate' : 'simple', 0.6);
      
      // Detect dialogue frequency
      const dialogueMarkers = (text.match(/["']/g) || []).length;
      const hasFrequentDialogue = dialogueMarkers / text.length > 0.02;
      
      updatePreference('style', 'dialogue-frequency', hasFrequentDialogue ? 'high' : 'low', 0.8);
      
      // Detect writing patterns with genre context
      const commonPhrases = extractCommonPhrases(text);
      commonPhrases.forEach(phrase => {
        updateWritingPattern(phrase.text, phrase.frequency, 'common-phrase', genreAnalysis.primaryGenre);
      });
      
    } catch (error) {
      console.error('Failed to analyze writing style:', error);
    } finally {
      setIsLearning(false);
    }
  }, [detectGenre, learnCompletionPatterns]);

  const updatePreference = (category: UserPreference['category'], key: string, value: any, confidence: number) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.category === category && p.key === key);
      
      if (existing) {
        return prev.map(p => 
          p.id === existing.id 
            ? { ...p, value, confidence: Math.min(1.0, confidence + existing.confidence * 0.1), updatedAt: new Date() }
            : p
        );
      } else {
        return [...prev, {
          id: `${category}-${key}-${Date.now()}`,
          category,
          key,
          value,
          confidence,
          updatedAt: new Date()
        }];
      }
    });
  };

  const updateWritingPattern = (pattern: string, frequency: number, context: string, genre: string = 'general') => {
    setWritingPatterns(prev => {
      const existing = prev.find(p => p.pattern === pattern && p.genre === genre);
      
      if (existing) {
        return prev.map(p => 
          p.id === existing.id 
            ? { ...p, frequency: p.frequency + frequency, lastSeen: new Date() }
            : p
        );
      } else {
        return [...prev, {
          id: `pattern-${Date.now()}`,
          pattern,
          frequency,
          context,
          genre,
          lastSeen: new Date()
        }];
      }
    });
  };

  const recordSuggestionFeedback = (suggestionId: string, action: SuggestionFeedback['action'], suggestionType: string, context: string) => {
    const feedback: SuggestionFeedback = {
      suggestionId,
      action,
      suggestionType,
      context,
      timestamp: new Date()
    };
    
    setSuggestionHistory(prev => [feedback, ...prev].slice(0, 1000));
    
    // Update preferences based on feedback
    if (action === 'accepted') {
      updatePreference('assistance', suggestionType, 'preferred', 0.3);
    } else if (action === 'rejected') {
      updatePreference('assistance', suggestionType, 'disliked', 0.2);
    }
  };

  const getPersonalizedSuggestions = (suggestionType: string): string[] => {
    // Get genre-specific suggestions
    const genreSuggestions = getGenreSpecificSuggestions(currentGenre);
    
    // Get user style preferences
    const userStylePrefs = preferences.filter(p => p.category === 'style');
    const assistancePrefs = preferences.filter(p => p.category === 'assistance');
    
    const personalizedSuggestions: string[] = [...genreSuggestions];
    
    // Adapt suggestions based on learned preferences
    userStylePrefs.forEach(pref => {
      if (pref.key === 'sentence-length' && pref.value === 'short' && pref.confidence > 0.5) {
        personalizedSuggestions.push('Your concise style works well here - consider maintaining this rhythm');
      } else if (pref.key === 'sentence-length' && pref.value === 'long' && pref.confidence > 0.5) {
        personalizedSuggestions.push('Consider breaking this into shorter sentences for clarity');
      }
      
      if (pref.key === 'dialogue-frequency' && pref.value === 'high' && pref.confidence > 0.6) {
        personalizedSuggestions.push('Your dialogue-heavy style is engaging - consider balancing with action');
      }
    });
    
    // Filter out disliked suggestion types
    const dislikedTypes = assistancePrefs
      .filter(p => p.value === 'disliked' && p.confidence > 0.3)
      .map(p => p.key);
    
    const filteredSuggestions = personalizedSuggestions
      .filter(suggestion => !dislikedTypes.some(type => suggestion.toLowerCase().includes(type)));
    
    return filteredSuggestions.slice(0, 5);
  };

  const extractCommonPhrases = (text: string) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const phrases: { [key: string]: number } = {};
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = `${words[i]} ${words[i + 1]}`;
      phrases[twoWord] = (phrases[twoWord] || 0) + 1;
      
      if (i < words.length - 2) {
        const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        phrases[threeWord] = (phrases[threeWord] || 0) + 1;
      }
    }
    
    return Object.entries(phrases)
      .filter(([phrase, count]) => count > 2 && phrase.length > 8)
      .map(([text, frequency]) => ({ text, frequency }))
      .slice(0, 10);
  };

  const getAdaptiveSettings = () => {
    const assistanceIntensity = preferences
      .filter(p => p.category === 'assistance')
      .reduce((avg, p) => {
        if (p.value === 'preferred') return avg + 0.3;
        if (p.value === 'disliked') return avg - 0.2;
        return avg;
      }, 0.5);

    const suggestionFrequency = Math.max(0.1, Math.min(1.0, assistanceIntensity));
    
    return {
      assistanceIntensity: Math.max(0.1, Math.min(1.0, assistanceIntensity)),
      suggestionFrequency,
      autoSuggestionsEnabled: suggestionFrequency > 0.3,
      proactiveSuggestionsEnabled: suggestionFrequency > 0.6,
      currentGenre,
      genreConfidence: genreHistory[0]?.confidence || 0
    };
  };

  const getEnhancedStats = () => {
    const completionStats = getCompletionStats();
    
    return {
      // Existing stats
      preferences: preferences.length,
      writingPatterns: writingPatterns.length,
      suggestionHistory: suggestionHistory.length,
      isLearning: isLearning || isAnalyzingGenre || isLearningCompletions,
      
      // New enhanced stats
      currentGenre,
      genreHistory: genreHistory.slice(0, 5),
      completionPatterns: completionStats.totalPatterns,
      genreBreakdown: completionStats.genreBreakdown,
      avgCompletionConfidence: completionStats.avgConfidence,
      mostUsedCompletions: completionStats.mostUsedPatterns.slice(0, 3)
    };
  };

  return {
    // Original functionality
    preferences,
    writingPatterns,
    suggestionHistory,
    isLearning: isLearning || isAnalyzingGenre || isLearningCompletions,
    analyzeWritingStyle,
    recordSuggestionFeedback,
    getPersonalizedSuggestions,
    getAdaptiveSettings,
    updatePreference,
    
    // Enhanced functionality
    currentGenre,
    genreHistory,
    generatePersonalizedCompletions,
    recordCompletionUsage,
    getEnhancedStats,
    
    // Direct access to sub-features
    detectGenre,
    getGenreSpecificSuggestions
  };
};
