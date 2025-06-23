
import { useEffect, useRef, useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useToast } from '@/hooks/use-toast';

interface SaveInsight {
  timestamp: Date;
  wordCount: number;
  aiSuggestions: number;
  writingMomentum: 'high' | 'medium' | 'low';
  keyChanges: string[];
}

export const useSmartAutoSave = (delay: number = 3000) => {
  const { state } = useWriting();
  const { suggestions } = useCollaborativeAI();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [lastSave, setLastSave] = useState<SaveInsight | null>(null);
  const [saveHistory, setSaveHistory] = useState<SaveInsight[]>([]);

  const analyzeWritingMomentum = (content: string, previousWordCount: number): 'high' | 'medium' | 'low' => {
    const currentWordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const wordsAdded = currentWordCount - previousWordCount;
    
    if (wordsAdded > 50) return 'high';
    if (wordsAdded > 20) return 'medium';
    return 'low';
  };

  const detectKeyChanges = (content: string): string[] => {
    const changes: string[] = [];
    
    // Detect new dialogue
    if (content.includes('"') && content.split('"').length > 2) {
      changes.push('Added dialogue');
    }
    
    // Detect new characters (simple heuristic)
    const sentences = content.split(/[.!?]+/);
    const lastSentences = sentences.slice(-5);
    const hasNewCharacterNames = lastSentences.some(sentence => 
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(sentence)
    );
    if (hasNewCharacterNames) {
      changes.push('Introduced characters');
    }
    
    // Detect scene transitions
    if (content.includes('***') || content.includes('---') || /Chapter \d+/.test(content)) {
      changes.push('Scene/chapter transition');
    }
    
    // Detect descriptive passages
    const descriptiveWords = ['beautiful', 'dark', 'mysterious', 'ancient', 'vibrant'];
    if (descriptiveWords.some(word => content.toLowerCase().includes(word))) {
      changes.push('Added descriptions');
    }
    
    return changes;
  };

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (state.currentDocument) {
        const currentContent = state.currentDocument.content || '';
        const currentWordCount = currentContent.split(/\s+/).filter(word => word.length > 0).length;
        const previousWordCount = lastSave?.wordCount || 0;
        
        const insight: SaveInsight = {
          timestamp: new Date(),
          wordCount: currentWordCount,
          aiSuggestions: suggestions.length,
          writingMomentum: analyzeWritingMomentum(currentContent, previousWordCount),
          keyChanges: detectKeyChanges(currentContent)
        };

        // Save to localStorage with AI insights
        const savedDocuments = JSON.parse(
          localStorage.getItem('manuscript-documents') || '[]'
        );
        
        const existingIndex = savedDocuments.findIndex(
          (doc: { id: string }) => doc.id === state.currentDocument?.id
        );
        
        const documentWithInsights = {
          ...state.currentDocument,
          lastSaveInsight: insight,
          saveHistory: [...saveHistory.slice(-10), insight] // Keep last 10 saves
        };
        
        if (existingIndex >= 0) {
          savedDocuments[existingIndex] = documentWithInsights;
        } else {
          savedDocuments.push(documentWithInsights);
        }
        
        localStorage.setItem('manuscript-documents', JSON.stringify(savedDocuments));
        
        // Update state
        setLastSave(insight);
        setSaveHistory(prev => [...prev.slice(-10), insight]);
        
        // Show contextual save message
        const wordsAdded = currentWordCount - previousWordCount;
        let saveMessage = 'Document auto-saved';
        
        if (wordsAdded > 0) {
          saveMessage += ` (+${wordsAdded} words)`;
        }
        
        if (insight.aiSuggestions > 0) {
          saveMessage += ` • ${insight.aiSuggestions} AI suggestions available`;
        }
        
        if (insight.keyChanges.length > 0) {
          saveMessage += ` • ${insight.keyChanges[0]}`;
        }

        console.log('Smart auto-save:', {
          document: state.currentDocument.title,
          ...insight
        });

        // Only show toast for significant saves to avoid spam
        if (wordsAdded > 20 || insight.keyChanges.length > 0) {
          toast({
            title: "Smart Save",
            description: saveMessage,
            duration: 2000
          });
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.currentDocument, suggestions, lastSave, saveHistory, toast, delay]);

  return {
    lastSave,
    saveHistory,
    isAutoSaveActive: !!timeoutRef.current
  };
};
