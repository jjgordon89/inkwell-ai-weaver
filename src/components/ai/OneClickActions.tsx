
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  ArrowRight, 
  FileText, 
  Maximize2, 
  RotateCcw,
  Zap 
} from 'lucide-react';
import { useWorkflowOptimization } from '@/hooks/useWorkflowOptimization';

interface OneClickActionsProps {
  selectedText?: string;
  isCompact?: boolean;
}

const OneClickActions: React.FC<OneClickActionsProps> = ({
  selectedText,
  isCompact = false
}) => {
  const { executeOneClickAction, getContextAwareActions } = useWorkflowOptimization();
  
  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wand2': return <Wand2 className="h-4 w-4" />;
      case 'ArrowRight': return <ArrowRight className="h-4 w-4" />;
      case 'FileText': return <FileText className="h-4 w-4" />;
      case 'Maximize2': return <Maximize2 className="h-4 w-4" />;
      case 'RotateCcw': return <RotateCcw className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const contextAwareActions = getContextAwareActions();

  if (isCompact) {
    return (
      <div className="flex gap-1">
        {contextAwareActions.slice(0, 3).map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => executeOneClickAction(action.id, selectedText)}
            className="h-6 px-2"
            title={action.label}
          >
            {getActionIcon(action.icon)}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          One-Click Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {contextAwareActions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {getActionIcon(action.icon)}
              <span className="text-sm font-medium">{action.label}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getPriorityColor(action.priority)}`}
              >
                {action.priority}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeOneClickAction(action.id, selectedText)}
              className="h-6 px-2"
            >
              <Zap className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {selectedText && (
          <div className="mt-3 p-2 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Selected Text:</p>
            <p className="text-xs truncate">
              "{selectedText.substring(0, 60)}..."
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OneClickActions;
