import React from 'react';
import { maskApiKey } from '@/utils/stringUtils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDisplayProps {
  /**
   * The API key to display
   */
  apiKey: string;
  
  /**
   * Optional label for the API key
   */
  label?: string;
  
  /**
   * Whether to allow copying the API key
   * @default true
   */
  allowCopy?: boolean;
  
  /**
   * Whether to allow viewing the full API key
   * @default false
   */
  allowReveal?: boolean;
  
  /**
   * CSS class for styling
   */
  className?: string;
}

/**
 * Component for displaying API keys with masking for security
 */
export function ApiKeyDisplay({
  apiKey,
  label,
  allowCopy = true,
  allowReveal = false,
  className = '',
}: ApiKeyDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { toast } = useToast();
  
  // Use masked or full key based on reveal state
  const displayedKey = isRevealed ? apiKey : maskApiKey(apiKey);
  
  // Copy API key to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy API key',
        variant: 'destructive',
      });
    });
  };
  
  // Toggle API key visibility
  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="font-medium mr-2">{label}:</span>
      )}
      
      <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
        {displayedKey}
      </code>
      
      <div className="flex gap-1">
        {allowReveal && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleReveal}
                  aria-label={isRevealed ? "Hide API key" : "Show API key"}
                >
                  {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRevealed ? "Hide API key" : "Show API key"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {allowCopy && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy API key to clipboard"
                >
                  <Copy size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Copy to clipboard
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

export default ApiKeyDisplay;
