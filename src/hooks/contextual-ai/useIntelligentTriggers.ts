
import { useState, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface IntelligentTrigger {
  id: string;
  type: 'writing_pause' | 'repetitive_text' | 'incomplete_thought' | 'dialogue_opportunity' | 'pacing_issue';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  message: string;
  suggestion: string;
  context: string;
  position: number;
}

export const useIntelligentTriggers = (
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const [activeTriggers, setActiveTriggers] = useState<IntelligentTrigger[]>([]);
  const [userActivity, setUserActivity] = useState({
    lastTypingTime: Date.now(),
    typingSpeed: 0,
    deletionCount: 0,
    pauseCount: 0
  });
  const activityRef = useRef(userActivity);
  activityRef.current = userActivity;

  const analyzeWritingPattern = useCallback((text: string, cursorPos: number) => {
    const triggers: IntelligentTrigger[] = [];
    const currentTime = Date.now();
    
    // Analyze recent text for patterns
    const recentText = text.slice(Math.max(0, cursorPos - 200), cursorPos);
    const sentences = recentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // 1. Detect incomplete thoughts (high confidence)
    if (sentences.length > 0) {
      const lastSentence = sentences[sentences.length - 1].trim();
      if (lastSentence.length > 15 && !lastSentence.match(/[.!?]$/) && 
          lastSentence.includes(' but ') || lastSentence.includes(' however ') || 
          lastSentence.includes(' although ')) {
        triggers.push({
          id: `incomplete-${Date.now()}`,
          type: 'incomplete_thought',
          severity: 'medium',
          confidence: 0.8,
          message: 'Incomplete thought detected',
          suggestion: 'Complete your current thought or start a new sentence',
          context: lastSentence,
          position: cursorPos
        });
      }
    }

    // 2. Detect repetitive patterns (medium confidence)
    const words = recentText.toLowerCase().split(/\s+/);
    const wordFreq = words.reduce((acc, word) => {
      if (word.length > 3) acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const repetitiveWords = Object.entries(wordFreq).filter(([word, count]) => count > 2);
    if (repetitiveWords.length > 0) {
      triggers.push({
        id: `repetitive-${Date.now()}`,
        type: 'repetitive_text',
        severity: 'low',
        confidence: 0.6,
        message: 'Repetitive word usage detected',
        suggestion: `Consider varying your use of "${repetitiveWords[0][0]}"`,
        context: recentText,
        position: cursorPos
      });
    }

    // 3. Detect dialogue opportunities (context-aware)
    const hasCharacterNames = /\b[A-Z][a-z]+ (said|asked|replied|shouted|whispered)\b/.test(recentText);
    const hasDialogue = recentText.includes('"');
    const narrativeRatio = recentText.split('.').length;
    
    if (narrativeRatio > 3 && !hasDialogue && text.length > 500) {
      triggers.push({
        id: `dialogue-${Date.now()}`,
        type: 'dialogue_opportunity',
        severity: 'low',
        confidence: 0.7,
        message: 'Consider adding dialogue to bring characters to life',
        suggestion: 'Add character dialogue to make the scene more engaging',
        context: recentText,
        position: cursorPos
      });
    }

    // 4. Detect pacing issues (advanced analysis)
    if (sentences.length > 2) {
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
      const sentenceLengthVariance = sentences.reduce((variance, s) => 
        variance + Math.pow(s.length - avgSentenceLength, 2), 0) / sentences.length;
      
      if (sentenceLengthVariance < 50 && avgSentenceLength > 80) {
        triggers.push({
          id: `pacing-${Date.now()}`,
          type: 'pacing_issue',
          severity: 'medium',
          confidence: 0.75,
          message: 'Sentence structure could be more varied',
          suggestion: 'Try mixing short and long sentences for better rhythm',
          context: sentences.slice(-2).join('. '),
          position: cursorPos
        });
      }
    }

    return triggers;
  }, []);

  const analyzeUserBehavior = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastType = currentTime - activityRef.current.lastTypingTime;
    
    // Detect writing pause with context
    if (timeSinceLastType > 15000) { // 15 seconds
      return {
        id: `pause-${Date.now()}`,
        type: 'writing_pause' as const,
        severity: 'high' as const,
        confidence: 0.9,
        message: 'Extended writing pause detected',
        suggestion: 'Would you like AI assistance to continue your story?',
        context: 'User has been inactive for an extended period',
        position: 0
      };
    }
    
    return null;
  }, []);

  const processIntelligentTriggers = useCallback((
    text: string, 
    cursorPos: number, 
    isTyping: boolean
  ) => {
    // Update user activity
    if (isTyping) {
      setUserActivity(prev => ({
        ...prev,
        lastTypingTime: Date.now(),
        typingSpeed: prev.typingSpeed + 1
      }));
    }

    // Analyze writing patterns
    const writingTriggers = analyzeWritingPattern(text, cursorPos);
    
    // Analyze user behavior
    const behaviorTrigger = analyzeUserBehavior();
    
    // Combine triggers
    const allTriggers = [
      ...writingTriggers,
      ...(behaviorTrigger ? [behaviorTrigger] : [])
    ];

    // Filter by confidence and avoid spam
    const highConfidenceTriggers = allTriggers.filter(trigger => 
      trigger.confidence > 0.7 && trigger.severity !== 'low'
    );

    // Update active triggers (limit to 2 most important)
    setActiveTriggers(prev => {
      const newTriggers = [...prev, ...highConfidenceTriggers]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2);
      
      return newTriggers;
    });

    // Trigger suggestions for high-priority items
    highConfidenceTriggers.forEach(trigger => {
      if (trigger.severity === 'high' || trigger.confidence > 0.8) {
        onTriggerSuggestion(trigger.suggestion, `intelligent_${trigger.type}`);
      }
    });
  }, [analyzeWritingPattern, analyzeUserBehavior, onTriggerSuggestion]);

  const dismissTrigger = useCallback((triggerId: string) => {
    setActiveTriggers(prev => prev.filter(t => t.id !== triggerId));
  }, []);

  return {
    activeTriggers,
    processIntelligentTriggers,
    dismissTrigger,
    userActivity
  };
};
