
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain, Zap } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface SmartTextCompletionProps {
  textBefore: string;
  textAfter: string;
  cursorPosition: number;
  onAccept: (completion: string) => void;
  onDismiss: () => void;
  isEnabled?: boolean;
}

const SmartTextCompletion: React.FC<SmartTextCompletionProps> = ({
  textBefore,
  textAfter,
  cursorPosition,
  onAccept,
  onDismiss,
  isEnabled = true
}) => {
  const [completions, setCompletions] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCompletion, setActiveCompletion] = useState(0);
  const { generateTextCompletion } = useCollaborativeAI();

  useEffect(() => {
    const generateCompletions = async () => {
      if (!isEnabled || textBefore.length < 20) return;

      setIsGenerating(true);
      try {
        // Generate multiple completion options
        const completionPromises = Array(3).fill(null).map(async (_, index) => {
          const result = await generateTextCompletion(textBefore, textAfter);
          return result;
        });

        const results = await Promise.all(completionPromises);
        const validCompletions = results.filter(r => r && r.length > 0 && r.length < 100);
        
        if (validCompletions.length > 0) {
          setCompletions(validCompletions);
          setIsVisible(true);
          setActiveCompletion(0);
          
          // Auto-hide after 15 seconds
          const timer = setTimeout(() => {
            setIsVisible(false);
            onDismiss();
          }, 15000);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Text completion failed:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    const debounceTimer = setTimeout(generateCompletions, 2000);
    return () => clearTimeout(debounceTimer);
  }, [textBefore, textAfter, generateTextCompletion, onDismiss, isEnabled]);

  const handleAccept = () => {
    if (completions[activeCompletion]) {
      onAccept(completions[activeCompletion]);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const cycleCompletion = () => {
    setActiveCompletion((prev) => (prev + 1) % completions.length);
  };

  if (!isEnabled || !isVisible || completions.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 ml-1 opacity-80 hover:opacity-100 transition-all duration-200">
      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-sm">
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 text-xs py-1 px-2 flex items-center gap-1"
          onClick={handleAccept}
        >
          <Brain className="h-3 w-3" />
          <span className="max-w-[120px] truncate">
            {completions[activeCompletion]}
          </span>
          <ArrowRight className="h-3 w-3" />
        </Badge>
        
        {completions.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleCompletion}
            className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
            title="Next suggestion"
          >
            <Zap className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
          title="Dismiss"
        >
          ×
        </Button>
      </div>
      
      {completions.length > 1 && (
        <div className="flex gap-0.5">
          {completions.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-colors ${
                index === activeCompletion ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartTextCompletion;
