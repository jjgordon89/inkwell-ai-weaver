import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bot, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useAISettings } from '@/contexts/AISettingsContext';

interface FloatingAISettingsProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnlyWhenNotConfigured?: boolean;
}

const FloatingAISettings: React.FC<FloatingAISettingsProps> = ({
  position = 'bottom-right',
  showOnlyWhenNotConfigured = false
}) => {
  const { isCurrentProviderConfigured } = useAI();
  const { openSettings } = useAISettings();
  
  const isConfigured = isCurrentProviderConfigured();
  
  // Hide if configured and showOnlyWhenNotConfigured is true
  if (showOnlyWhenNotConfigured && isConfigured) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const handleClick = () => {
    if (!isConfigured) {
      openSettings('provider');
    } else {
      openSettings('overview');
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Button 
        onClick={handleClick}
        size="lg"
        className={`
          rounded-full shadow-lg transition-all duration-200 hover:scale-105
          ${!isConfigured 
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200' 
            : 'bg-primary hover:bg-primary/90 shadow-primary/20'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {!isConfigured ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
          <span className="hidden sm:inline">
            {!isConfigured ? 'Setup AI' : 'AI Settings'}
          </span>
          <Settings className="h-4 w-4" />
        </div>
      </Button>
      
      {/* Status indicator badge */}
      <Badge 
        variant={isConfigured ? "secondary" : "destructive"}
        className="absolute -top-2 -right-2 text-xs"
      >
        {isConfigured ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <AlertCircle className="h-3 w-3" />
        )}
      </Badge>
    </div>
  );
};

export default FloatingAISettings;
