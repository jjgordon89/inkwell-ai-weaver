
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface SmartTextCompletionProps {
  textBefore: string;
  textAfter: string;
  cursorPosition: number;
  onAccept: (completion: string) => void;
  onDismiss: () => void;
}

const SmartTextCompletion: React.FC<SmartTextCompletionProps> = ({
  textBefore,
  textAfter,
  cursorPosition,
  onAccept,
  onDismiss
}) => {
  const [completion, setCompletion] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const { generateTextCompletion } = useCollaborativeAI();

  useEffect(() => {
    const generateCompletion = async () => {
      if (textBefore.length < 20) return;

      try {
        const result = await generateTextCompletion(textBefore, textAfter);
        if (result && result.length > 0 && result.length < 50) {
          setCompletion(result);
          setIsVisible(true);
          
          // Auto-hide after 10 seconds
          const timer = setTimeout(() => {
            setIsVisible(false);
            onDismiss();
          }, 10000);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Text completion failed:', error);
      }
    };

    const debounceTimer = setTimeout(generateCompletion, 1500);
    return () => clearTimeout(debounceTimer);
  }, [textBefore, textAfter, generateTextCompletion, onDismiss]);

  const handleAccept = () => {
    onAccept(completion);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible || !completion) return null;

  return (
    <div className="inline-flex items-center gap-2 ml-1 opacity-70 hover:opacity-100 transition-opacity">
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-primary/10 text-xs py-0 px-2"
        onClick={handleAccept}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        {completion}
        <ArrowRight className="h-3 w-3 ml-1" />
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
      >
        ×
      </Button>
    </div>
  );
};

export default SmartTextCompletion;
