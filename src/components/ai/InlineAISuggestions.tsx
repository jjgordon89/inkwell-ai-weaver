
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Wand2, Zap, Plus, Brain } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import InlineAITooltip from './InlineAITooltip';
import AIRevisionMode from './AIRevisionMode';

interface InlineAISuggestionsProps {
  selectedText: string;
  onApply: (newText: string) => void;
  onDismiss: () => void;
  position: { x: number; y: number };
  documentContent?: string;
}

const InlineAISuggestions: React.FC<InlineAISuggestionsProps> = ({
  selectedText,
  onApply,
  onDismiss,
  position,
  documentContent = ''
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'suggestions' | 'revision' | 'tooltip'>('suggestions');
  const { processText } = useAI();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!selectedText || selectedText.length < 3) return;
      
      setIsLoading(true);
      try {
        const improvement = await processText(selectedText, 'improve');
        if (improvement) {
          setSuggestions([improvement]);
        }
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeMode === 'suggestions') {
      generateSuggestions();
    }
  }, [selectedText, processText, activeMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onDismiss]);

  const handleQuickAction = async (action: 'shorten' | 'expand' | 'improve') => {
    if (!selectedText) return;
    
    setIsLoading(true);
    try {
      const result = await processText(selectedText, action);
      if (result) {
        onApply(result);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedText) return null;

  // Show tooltip for very short selections
  if (selectedText.length < 20) {
    return (
      <InlineAITooltip
        selectedText={selectedText}
        onApply={onApply}
        onDismiss={onDismiss}
        position={position}
      />
    );
  }

  return (
    <Card
      ref={cardRef}
      className="fixed z-50 w-96 max-w-[90vw] p-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm"
      style={{
        left: Math.min(position.x, window.innerWidth - 400),
        top: Math.max(position.y - 120, 10),
        maxHeight: 'calc(100vh - 20px)',
        overflow: 'auto'
      }}
    >
      <div className="space-y-4">
        {/* Header with mode selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistance</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={activeMode === 'suggestions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('suggestions')}
              className="h-6 px-2 text-xs"
            >
              Suggestions
            </Button>
            <Button
              variant={activeMode === 'revision' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('revision')}
              className="h-6 px-2 text-xs"
            >
              <Brain className="h-3 w-3 mr-1" />
              Revise
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Selected text preview */}
        <div className="p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs font-medium mb-1">Selected Text:</p>
          <p className="text-xs text-muted-foreground break-words">
            "{selectedText.substring(0, 80)}{selectedText.length > 80 ? '...' : ''}"
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {selectedText.split(' ').length} words
            </Badge>
            <Badge variant="outline" className="text-xs">
              {selectedText.length} chars
            </Badge>
          </div>
        </div>

        {/* Content based on active mode */}
        {activeMode === 'suggestions' && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Generating suggestions...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onApply(suggestion)}
                  >
                    <p className="text-sm mb-2">{suggestion}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="h-6 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        AI Enhanced
                      </Badge>
                    </div>
                  </div>
                ))}

                {suggestions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-xs">No suggestions available</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick action buttons */}
            <div className="flex gap-1 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => handleQuickAction('shorten')}
                disabled={isLoading}
              >
                <Zap className="h-3 w-3 mr-1" />
                Shorten
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => handleQuickAction('expand')}
                disabled={isLoading}
              >
                <Plus className="h-3 w-3 mr-1" />
                Expand
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => handleQuickAction('improve')}
                disabled={isLoading}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Improve
              </Button>
            </div>
          </>
        )}

        {activeMode === 'revision' && (
          <div className="min-h-[200px] max-h-[300px] overflow-auto">
            <AIRevisionMode
              documentContent={documentContent}
              isActive={true}
              onToggle={() => setActiveMode('suggestions')}
              onApplyRevisions={(revisions) => {
                // Apply first revision for now
                if (revisions.length > 0) {
                  onApply(revisions[0].revisedText);
                }
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default InlineAISuggestions;
