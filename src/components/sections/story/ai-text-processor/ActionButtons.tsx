
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wand2, Zap, Lightbulb, CheckCircle } from 'lucide-react';

interface ActionButtonsProps {
  onAction: (action: 'improve' | 'shorten' | 'expand' | 'fix-grammar') => void;
  processingAction: string | null;
  isProcessing: boolean;
  isProviderConfigured: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  processingAction,
  isProcessing,
  isProviderConfigured
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'improve': return <Wand2 className="h-4 w-4" />;
      case 'shorten': return <Zap className="h-4 w-4" />;
      case 'expand': return <Lightbulb className="h-4 w-4" />;
      case 'fix-grammar': return <CheckCircle className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'improve': return 'Enhance clarity and flow';
      case 'shorten': return 'Make more concise';
      case 'expand': return 'Add detail and depth';
      case 'fix-grammar': return 'Correct grammar and style';
      default: return '';
    }
  };

  const actions = [
    { action: 'improve', label: 'Improve' },
    { action: 'shorten', label: 'Shorten' },
    { action: 'expand', label: 'Expand' },
    { action: 'fix-grammar', label: 'Fix Grammar' }
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(({ action, label }) => (
        <Button
          key={action}
          variant="outline"
          size="sm"
          onClick={() => onAction(action)}
          disabled={isProcessing || !isProviderConfigured}
          className="flex items-center gap-2"
          title={!isProviderConfigured ? 'Configure AI provider first' : getActionDescription(action)}
        >
          {processingAction === action ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            getActionIcon(action)
          )}
          {processingAction === action ? 'Processing...' : label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
