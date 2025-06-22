
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useSmoothTransitions } from '@/hooks/useSmoothTransitions';
import SubtleAIIndicator from './SubtleAIIndicator';
import QuickActions from './overlay/QuickActions';
import SuggestionsList from './overlay/SuggestionsList';

interface ImprovedAIOverlayProps {
  isVisible: boolean;
  suggestions: any[];
  selectedText: string;
  isAnalyzing: boolean;
  position?: { x: number; y: number };
  onClose: () => void;
  onApplySuggestion: (suggestion: any) => void;
  onDismissSuggestion: (id: string) => void;
  onImproveSelection: () => void;
}

const ImprovedAIOverlay: React.FC<ImprovedAIOverlayProps> = ({
  isVisible,
  suggestions,
  selectedText,
  isAnalyzing,
  position,
  onClose,
  onApplySuggestion,
  onDismissSuggestion,
  onImproveSelection
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);
  const transition = useSmoothTransitions(200);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      transition.show(100);
      
      // Auto-hide after 10 seconds of inactivity for low-priority suggestions
      const hasHighPriority = suggestions.some(s => s.confidence > 80);
      if (!hasHighPriority && suggestions.length > 0) {
        const timer = setTimeout(() => {
          setIsMinimized(true);
        }, 10000);
        setAutoHideTimer(timer);
      }
    } else {
      transition.hide();
    }
    
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [isVisible, suggestions, transition]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!transition.isVisible) return null;

  const overlayStyle = position ? {
    position: 'fixed' as const,
    top: Math.max(10, position.y - 100),
    right: 20,
    left: 'auto',
    maxWidth: '320px',
    zIndex: 50,
    ...transition.style
  } : {
    ...transition.style
  };

  return (
    <div
      ref={overlayRef}
      style={overlayStyle}
      className="w-full max-w-sm"
    >
      <Card className="shadow-xl border-2 border-primary/10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <SubtleAIIndicator 
              type={isAnalyzing ? 'analyzing' : 'enhanced'} 
              showLabel={true}
            />
            {suggestions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isMinimized && suggestions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            )}
            
            {isMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 space-y-3">
          <QuickActions
            selectedText={selectedText}
            onImproveSelection={onImproveSelection}
          />

          {!isMinimized && (
            <SuggestionsList
              suggestions={suggestions}
              isAnalyzing={isAnalyzing}
              onApplySuggestion={onApplySuggestion}
              onDismissSuggestion={onDismissSuggestion}
            />
          )}

          {isMinimized && suggestions.length > 0 && (
            <div className="text-center py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="text-xs"
              >
                Show {suggestions.length} suggestions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedAIOverlay;
