
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";

interface ContinueWritingButtonProps {
  textareaRef?: React.RefObject<any>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const ContinueWritingButton: React.FC<ContinueWritingButtonProps> = ({ 
  textareaRef, 
  variant = "outline", 
  size = "sm" 
}) => {
  const { processText, isProcessing, isCurrentProviderConfigured } = useAI();
  const { state, dispatch } = useWriting();
  const { toast } = useToast();

  const handleContinueWriting = async () => {
    if (!state.currentDocument || !isCurrentProviderConfigured()) {
      toast({
        title: "AI Not Configured",
        description: "Please configure an AI provider first",
        variant: "destructive"
      });
      return;
    }

    const content = state.currentDocument.content || '';
    if (content.length < 10) {
      toast({
        title: "Insufficient Content",
        description: "Write at least a few sentences first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the last 200 characters as context
      const contextText = content.slice(-200);
      const continuation = await processText(contextText, 'continue');

      if (continuation) {
        const newContent = content + ' ' + continuation;
        
        dispatch({
          type: 'UPDATE_DOCUMENT_CONTENT',
          payload: {
            id: state.currentDocument.id,
            content: newContent
          }
        });

        // Focus textarea if available
        if (textareaRef?.current) {
          textareaRef.current.focus();
          // Move cursor to end
          const textareaElement = textareaRef.current.querySelector('textarea');
          if (textareaElement) {
            textareaElement.setSelectionRange(newContent.length, newContent.length);
          }
        }

        toast({
          title: "Story Continued",
          description: "AI has added to your story"
        });
      }
    } catch (error) {
      console.error('Continue writing failed:', error);
      toast({
        title: "Failed to Continue",
        description: "Could not generate continuation",
        variant: "destructive"
      });
    }
  };

  if (!isCurrentProviderConfigured()) {
    return (
      <Button variant={variant} size={size} disabled>
        <ArrowRight className="h-4 w-4 mr-2" />
        Continue Writing (Configure AI first)
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleContinueWriting}
      disabled={isProcessing || !state.currentDocument?.content}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4 mr-2" />
      )}
      Continue Writing
    </Button>
  );
};

export default ContinueWritingButton;
