import { useState, useCallback } from 'react';

interface ContextualSuggestion {
  id: string;
  type: 'writing_block' | 'character_dialogue' | 'structure' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

export const useContextualSuggestionsManager = () => {
  const [contextualSuggestions, setContextualSuggestions] = useState<ContextualSuggestion[]>([]);

  // Handle contextual AI suggestions with improved UX
  const handleContextualSuggestion = useCallback((message: string, type: string) => {
    const suggestion: ContextualSuggestion = {
      id: `contextual-${Date.now()}-${Math.random()}`,
      type: type.includes('writing_block') ? 'writing_block' : 
            type.includes('character') ? 'character_dialogue' :
            type.includes('structure') ? 'structure' : 'general',
      message,
      priority: type.includes('pause') ? 'high' : 'medium',
      actionable: true
    };
    
    setContextualSuggestions(prev => {
      // Remove duplicates and keep only recent suggestions
      const filtered = prev.filter(s => s.message !== message && s.type !== suggestion.type);
      return [...filtered, suggestion].slice(-3); // Keep only 3 suggestions max
    });

    // Auto-dismiss low priority suggestions after 15 seconds
    if (suggestion.priority !== 'high') {
      setTimeout(() => {
        setContextualSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      }, 15000);
    }
  }, []);

  // Dismiss contextual suggestions
  const dismissContextualSuggestion = useCallback((id: string) => {
    setContextualSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    contextualSuggestions,
    handleContextualSuggestion,
    dismissContextualSuggestion,
    setContextualSuggestions
  };
};
