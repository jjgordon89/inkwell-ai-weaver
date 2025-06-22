
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Zap, X } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useAdaptiveLearning } from '@/hooks/learning/useAdaptiveLearning';

interface SmartCompletionManagerProps {
  textBefore: string;
  textAfter: string;
  cursorPosition: number;
  onAcceptCompletion: (completion: string) => void;
  onDismiss: () => void;
  isEnabled?: boolean;
  isVisible?: boolean;
}

const SmartCompletionManager: React.FC<SmartCompletionManagerProps> = ({
  textBefore,
  textAfter,
  cursorPosition,
  onAcceptCompletion,
  onDismiss,
  isEnabled = true,
  isVisible = true
}) => {
  const [completions, setCompletions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCompletions, setShowCompletions] = useState(false);
  
  const { generateTextCompletion } = useCollaborativeAI();
  const { generatePersonalizedCompletions, recordCompletionUsage, currentGenre } = useAdaptiveLearning();

  const generateCompletions = useCallback(async () => {
    if (!isEnabled || !isVisible || textBefore.length < 10) return;

    setIsGenerating(true);
    try {
      // Get personalized completions first (faster)
      const personalizedCompletions = generatePersonalizedCompletions(textBefore, currentGenre, 2);
      const personalizedTexts = personalizedCompletions.map(c => c.text);

      // Get AI completion as fallback
      const aiCompletion = await generateTextCompletion(textBefore, textAfter);
      
      // Combine and filter completions
      const allCompletions = [
        ...personalizedTexts,
        ...(aiCompletion ? [aiCompletion] : [])
      ].filter((completion, index, arr) => 
        completion && 
        completion.length > 0 && 
        completion.length < 150 &&
        arr.indexOf(completion) === index // Remove duplicates
      );

      if (allCompletions.length > 0) {
        setCompletions(allCompletions);
        setActiveIndex(0);
        setShowCompletions(true);
        
        // Auto-hide after 12 seconds
        setTimeout(() => {
          setShowCompletions(false);
        }, 12000);
      }
    } catch (error) {
      console.error('Failed to generate completions:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [textBefore, textAfter, generateTextCompletion, generatePersonalizedCompletions, currentGenre, isEnabled, isVisible]);

  // Debounced completion generation
  useEffect(() => {
    const timer = setTimeout(generateCompletions, 1500);
    return () => clearTimeout(timer);
  }, [generateCompletions]);

  const handleAcceptCompletion = useCallback(() => {
    const completion = completions[activeIndex];
    if (completion) {
      onAcceptCompletion(completion);
      
      // Record usage for learning
      const personalizedCompletion = generatePersonalizedCompletions(textBefore, currentGenre, 5)
        .find(c => c.text === completion);
      
      if (personalizedCompletion) {
        recordCompletionUsage(personalizedCompletion);
      }
      
      setShowCompletions(false);
    }
  }, [completions, activeIndex, onAcceptCompletion, generatePersonalizedCompletions, textBefore, currentGenre, recordCompletionUsage]);

  const handleNextCompletion = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % completions.length);
  }, [completions.length]);

  const handleDismiss = useCallback(() => {
    setShowCompletions(false);
    onDismiss();
  }, [onDismiss]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCompletions) return;
      
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        handleAcceptCompletion();
      } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        handleNextCompletion();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCompletions, handleAcceptCompletion, handleNextCompletion, handleDismiss]);

  if (!isEnabled || !isVisible || !showCompletions || completions.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 ml-2 animate-fade-in">
      <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg p-1 shadow-sm border-primary/20">
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 text-xs py-1 px-2 flex items-center gap-1 max-w-[200px]"
          onClick={handleAcceptCompletion}
        >
          <Brain className="h-3 w-3 text-primary" />
          <span className="truncate">
            {completions[activeIndex]}
          </span>
          <ArrowRight className="h-3 w-3 opacity-60" />
        </Badge>
        
        {completions.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextCompletion}
            className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
            title="Next suggestion (Ctrl+→)"
          >
            <Zap className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
          title="Dismiss (Esc)"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {completions.length > 1 && (
        <div className="flex gap-0.5">
          {completions.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-colors ${
                index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground opacity-60">
        Tab to accept
      </div>
    </div>
  );
};

export default SmartCompletionManager;
