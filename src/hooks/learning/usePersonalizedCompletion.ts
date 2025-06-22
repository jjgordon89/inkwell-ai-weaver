import { useState, useCallback, useEffect } from 'react';

export interface CompletionPattern {
  id: string;
  trigger: string;
  completion: string;
  frequency: number;
  context: string[];
  genre: string;
  confidence: number;
  lastUsed: Date;
}

export interface PersonalizedCompletion {
  text: string;
  confidence: number;
  pattern: CompletionPattern;
  reasoning: string;
}

export const usePersonalizedCompletion = () => {
  const [completionPatterns, setCompletionPatterns] = useState<CompletionPattern[]>([]);
  const [isLearning, setIsLearning] = useState(false);

  // Load patterns from localStorage
  useEffect(() => {
    const savedPatterns = localStorage.getItem('completion-patterns');
    if (savedPatterns) {
      try {
        const patterns = JSON.parse(savedPatterns);
        setCompletionPatterns(patterns);
      } catch (error) {
        console.error('Failed to load completion patterns:', error);
      }
    }
  }, []);

  // Save patterns to localStorage
  useEffect(() => {
    localStorage.setItem('completion-patterns', JSON.stringify(completionPatterns));
  }, [completionPatterns]);

  const learnFromText = useCallback(async (text: string, genre: string = 'general') => {
    if (!text || text.length < 50) return;

    setIsLearning(true);

    try {
      // Extract common sentence patterns
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const patterns: Partial<CompletionPattern>[] = [];

      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        const words = trimmed.split(/\s+/);
        
        if (words.length < 3) return;

        // Extract patterns for different completion types
        
        // 1. Sentence starters (first 2-3 words)
        if (words.length >= 3) {
          const trigger = words.slice(0, 2).join(' ').toLowerCase();
          const completion = words.slice(2).join(' ');
          
          patterns.push({
            trigger,
            completion,
            context: ['sentence_start'],
            genre,
            confidence: 0.6
          });
        }

        // 2. Common phrase patterns
        const commonPhrases = extractCommonPhrases(trimmed);
        commonPhrases.forEach(phrase => {
          const parts = phrase.split(' ');
          if (parts.length >= 2) {
            const trigger = parts.slice(0, -1).join(' ').toLowerCase();
            const completion = parts[parts.length - 1];
            
            patterns.push({
              trigger,
              completion,
              context: ['phrase'],
              genre,
              confidence: 0.8
            });
          }
        });

        // 3. Dialogue patterns
        if (trimmed.includes('"') || trimmed.includes("'")) {
          const dialogueMatch = trimmed.match(/(["'])(.*?)\1/);
          if (dialogueMatch) {
            const dialogue = dialogueMatch[2];
            const words = dialogue.split(' ');
            if (words.length >= 3) {
              const trigger = words.slice(0, 2).join(' ').toLowerCase();
              const completion = words.slice(2).join(' ');
              
              patterns.push({
                trigger,
                completion,
                context: ['dialogue'],
                genre,
                confidence: 0.7
              });
            }
          }
        }
      });

      // Update completion patterns
      setCompletionPatterns(prev => {
        const updated = [...prev];
        
        patterns.forEach(newPattern => {
          if (!newPattern.trigger || !newPattern.completion) return;
          
          const existingIndex = updated.findIndex(
            p => p.trigger === newPattern.trigger && p.genre === newPattern.genre
          );
          
          if (existingIndex >= 0) {
            // Update existing pattern
            updated[existingIndex] = {
              ...updated[existingIndex],
              frequency: updated[existingIndex].frequency + 1,
              confidence: Math.min(1, updated[existingIndex].confidence + 0.1),
              lastUsed: new Date()
            };
          } else {
            // Add new pattern
            updated.push({
              id: `pattern-${Date.now()}-${Math.random()}`,
              trigger: newPattern.trigger!,
              completion: newPattern.completion!,
              frequency: 1,
              context: newPattern.context || [],
              genre: newPattern.genre || 'general',
              confidence: newPattern.confidence || 0.5,
              lastUsed: new Date()
            });
          }
        });
        
        // Keep only top 1000 patterns, sorted by frequency and recency
        return updated
          .sort((a, b) => {
            const scoreA = a.frequency * a.confidence + (Date.now() - a.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
            const scoreB = b.frequency * b.confidence + (Date.now() - b.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
            return scoreB - scoreA;
          })
          .slice(0, 1000);
      });

    } catch (error) {
      console.error('Failed to learn from text:', error);
    } finally {
      setIsLearning(false);
    }
  }, []);

  const generatePersonalizedCompletions = useCallback((
    textBefore: string,
    genre: string = 'general',
    maxCompletions: number = 3
  ): PersonalizedCompletion[] => {
    if (!textBefore || textBefore.length < 2) return [];

    const lastWords = textBefore.trim().split(/\s+/).slice(-3).join(' ').toLowerCase();
    const lastTwoWords = textBefore.trim().split(/\s+/).slice(-2).join(' ').toLowerCase();
    const lastWord = textBefore.trim().split(/\s+/).slice(-1)[0]?.toLowerCase() || '';

    const matchingPatterns = completionPatterns.filter(pattern => {
      // Exact trigger match
      if (lastWords.endsWith(pattern.trigger) || lastTwoWords.endsWith(pattern.trigger)) {
        return true;
      }
      
      // Partial match for longer triggers
      if (pattern.trigger.length > 6 && lastWords.includes(pattern.trigger)) {
        return true;
      }
      
      return false;
    });

    // Score and rank patterns
    const scoredCompletions = matchingPatterns
      .map(pattern => {
        let score = pattern.confidence * pattern.frequency;
        
        // Boost score for genre match
        if (pattern.genre === genre) {
          score *= 1.5;
        }
        
        // Boost score for recent usage
        const daysSinceUsed = (Date.now() - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUsed < 7) {
          score *= 1.2;
        }
        
        // Penalize very frequent patterns to add variety
        if (pattern.frequency > 10) {
          score *= 0.8;
        }

        const reasoning = `Based on ${pattern.frequency} similar patterns in ${pattern.genre} writing`;

        return {
          text: pattern.completion,
          confidence: Math.min(1, score),
          pattern,
          reasoning
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxCompletions);

    return scoredCompletions;
  }, [completionPatterns]);

  const recordCompletionUsage = useCallback((completion: PersonalizedCompletion) => {
    setCompletionPatterns(prev => 
      prev.map(pattern => 
        pattern.id === completion.pattern.id
          ? { ...pattern, frequency: pattern.frequency + 1, lastUsed: new Date() }
          : pattern
      )
    );
  }, []);

  const getCompletionStats = useCallback(() => {
    const totalPatterns = completionPatterns.length;
    const genreBreakdown = completionPatterns.reduce((acc, pattern) => {
      acc[pattern.genre] = (acc[pattern.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgConfidence = completionPatterns.length > 0
      ? completionPatterns.reduce((sum, p) => sum + p.confidence, 0) / completionPatterns.length
      : 0;

    const mostUsedPatterns = completionPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      totalPatterns,
      genreBreakdown,
      avgConfidence,
      mostUsedPatterns
    };
  }, [completionPatterns]);

  return {
    completionPatterns,
    isLearning,
    learnFromText,
    generatePersonalizedCompletions,
    recordCompletionUsage,
    getCompletionStats
  };
};

// Helper function to extract common phrases
function extractCommonPhrases(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const phrases: string[] = [];
  
  // Extract 2-4 word phrases
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      if (phrase.length > 6 && !phrase.match(/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/)) {
        phrases.push(phrase);
      }
    }
  }
  
  return [...new Set(phrases)]; // Remove duplicates
}
