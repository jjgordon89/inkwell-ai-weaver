
import React, { useState } from 'react';
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
  Lightbulb
} from 'lucide-react';

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

  if (!isVisible || suggestions.length === 0) return null;

  const getIcon = (type: ContextualSuggestion['type']) => {
    switch (type) {
      case 'writing_block': return <Clock className="h-4 w-4" />;
      case 'character_dialogue': return <Users className="h-4 w-4" />;
      case 'structure': return <RefreshCw className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ContextualSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
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

  const style = position ? {
    position: 'fixed' as const,
    top: position.y + 10,
    left: position.x,
    zIndex: 1000,
    maxWidth: '300px'
  } : {};

  return (
    <div style={style} className="space-y-2">
      {suggestions.slice(0, 3).map((suggestion) => (
        <Card key={suggestion.id} className="shadow-lg border-l-4 border-l-primary">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                {getIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">
                    {suggestion.message.length > 80 && !expandedSuggestions.has(suggestion.id)
                      ? `${suggestion.message.substring(0, 80)}...`
                      : suggestion.message
                    }
                  </p>
                  {suggestion.message.length > 80 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(suggestion.id)}
                      className="p-0 h-auto text-xs text-muted-foreground mt-1"
                    >
                      {expandedSuggestions.has(suggestion.id) ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                  {suggestion.actionable && onApplyAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyAction(suggestion)}
                      className="mt-2 text-xs"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Apply AI Help
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(suggestion.id)}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {suggestions.length > 3 && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-sm">
            +{suggestions.length - 3} more suggestions available
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ContextualSuggestions;
