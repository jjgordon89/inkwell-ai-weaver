
import { useState, useEffect, useCallback } from 'react';

export interface SuggestionFeedback {
  suggestionId: string;
  action: 'accepted' | 'rejected' | 'modified';
  suggestionType: string;
  context: string;
  timestamp: Date;
}

export const useFeedbackSystem = () => {
  const [suggestionHistory, setSuggestionHistory] = useState<SuggestionFeedback[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('suggestion-history');
    if (saved) {
      try {
        setSuggestionHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load suggestion history:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('suggestion-history', JSON.stringify(suggestionHistory));
  }, [suggestionHistory]);

  const recordFeedback = useCallback((
    suggestionId: string, 
    action: SuggestionFeedback['action'], 
    suggestionType: string, 
    context: string
  ) => {
    const feedback: SuggestionFeedback = {
      suggestionId,
      action,
      suggestionType,
      context,
      timestamp: new Date()
    };
    
    setSuggestionHistory(prev => [feedback, ...prev].slice(0, 1000)); // Keep last 1000
  }, []);

  const getFeedbackStats = useCallback(() => {
    const total = suggestionHistory.length;
    const accepted = suggestionHistory.filter(f => f.action === 'accepted').length;
    const rejected = suggestionHistory.filter(f => f.action === 'rejected').length;
    
    const acceptanceRate = total > 0 ? accepted / total : 0;
    
    // Get most accepted suggestion types
    const typeStats = suggestionHistory.reduce((acc, feedback) => {
      if (feedback.action === 'accepted') {
        acc[feedback.suggestionType] = (acc[feedback.suggestionType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const preferredTypes = Object.entries(typeStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    return {
      total,
      accepted,
      rejected,
      acceptanceRate,
      preferredTypes
    };
  }, [suggestionHistory]);

  return {
    suggestionHistory,
    recordFeedback,
    getFeedbackStats
  };
};
