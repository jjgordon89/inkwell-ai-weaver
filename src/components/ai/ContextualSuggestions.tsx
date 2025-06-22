
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  MessageSquare, 
  Users, 
  Clock, 
  RefreshCw,
  X,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSmoothTransitions } from '@/hooks/useSmoothTransitions';

interface ContextualSuggestion {
  id: string;
  type: 'writing_block' | 'character_dialogue' | 'structure' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

interface ContextualSuggestionsProps {
  suggestions: ContextualSuggestion[];
  onDismiss: (id: string) => void;
  onApplyAction?: (suggestion: ContextualSuggestion) => void;
  isVisible: boolean;
  position?: { x: number; y: number };
}

const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({
  suggestions,
  onDismiss,
  onApplyAction,
  isVisible,
  position
}) => {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const transition = useSmoothTransitions();

  useEffect(() => {
    if (isVisible && suggestions.length > 0) {
      transition.show(300); // Subtle delay before showing
    } else {
      transition.hide();
    }
  }, [isVisible, suggestions.length, transition]);

  // Auto-minimize low priority suggestions after 5 seconds
  useEffect(() => {
    if (isVisible && suggestions.length > 0) {
      const hasHighPriority = suggestions.some(s => s.priority === 'high');
      if (!hasHighPriority) {
        const timer = setTimeout(() => setIsMinimized(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, suggestions]);

  if (!transition.isVisible) return null;

  const getIcon = (type: ContextualSuggestion['type']) => {
    switch (type) {
      case 'writing_block': return <Clock className="h-3 w-3" />;
      case 'character_dialogue': return <Users className="h-3 w-3" />;
      case 'structure': return <RefreshCw className="h-3 w-3" />;
      default: return <Lightbulb className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: ContextualSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSuggestions(newExpanded);
  };

  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
  const visibleSuggestions = isMinimized ? highPrioritySuggestions : suggestions.slice(0, 2);

  const style = position ? {
    position: 'fixed' as const,
    top: position.y + 20,
    right: 20,
    zIndex: 100,
    maxWidth: '280px',
    opacity: transition.opacity,
    transform: `translateY(${(1 - transition.opacity) * 10}px)`,
    transition: 'all 0.2s ease-out'
  } : {
    opacity: transition.opacity,
    transform: `translateY(${(1 - transition.opacity) * 10}px)`,
    transition: 'all 0.2s ease-out'
  };

  return (
    <div style={style} className="space-y-1">
      {/* Minimized state */}
      {isMinimized && suggestions.length > 0 && (
        <Card className="shadow-sm border border-primary/10 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {suggestions.length} AI suggestion{suggestions.length > 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-5 w-5 p-0"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded state */}
      {!isMinimized && visibleSuggestions.map((suggestion) => (
        <Card key={suggestion.id} className="shadow-sm border-l-4 border-l-primary/30 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {getIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <Badge 
                      className={`text-xs px-1 py-0 ${getPriorityColor(suggestion.priority)}`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {suggestion.message.length > 60 && !expandedSuggestions.has(suggestion.id)
                      ? `${suggestion.message.substring(0, 60)}...`
                      : suggestion.message
                    }
                  </p>
                  {suggestion.message.length > 60 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(suggestion.id)}
                      className="p-0 h-auto text-xs text-muted-foreground mt-1 hover:text-foreground"
                    >
                      {expandedSuggestions.has(suggestion.id) ? 'Less' : 'More'}
                    </Button>
                  )}
                  {suggestion.actionable && onApplyAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyAction(suggestion)}
                      className="mt-1 h-6 text-xs px-2 hover:bg-primary/5"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Help
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {!isMinimized && suggestions.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(suggestion.id)}
                  className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {!isMinimized && suggestions.length > 2 && (
        <Alert className="bg-muted/30 border-muted">
          <Brain className="h-3 w-3" />
          <AlertDescription className="text-xs">
            +{suggestions.length - 2} more suggestions
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ContextualSuggestions;
