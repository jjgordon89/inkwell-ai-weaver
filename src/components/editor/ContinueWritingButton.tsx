
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";

interface ContinueWritingButtonProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
}

const ContinueWritingButton: React.FC<ContinueWritingButtonProps> = ({ 
  textareaRef, 
  variant = "outline", 
  size = "sm",
  disabled = false
}) => {
  const { processText, isProcessing, isCurrentProviderConfigured } = useAI();
  const { state, dispatch } = useWriting();
  const { toast } = useToast();

  const handleContinueWriting = async () => {
    if (!state.currentDocument || !isCurrentProviderConfigured() || disabled) {
      toast({
        title: "AI Not Available",
        description: "Please configure an AI provider first or check document status",
        variant: "destructive"
      });
      return;
    }

    const content = state.currentDocument.content || '';
    if (content.length < 10) {
      toast({
        title: "Need More Content",
        description: "Write at least a few sentences for the AI to continue from",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the last 200 characters as context for continuation
      const contextText = content.slice(-200);
      console.log('Continuing writing with context:', contextText.substring(0, 50) + '...');
      
      const continuation = await processText(contextText, 'continue');
      console.log('Generated continuation:', continuation);

      if (continuation && continuation.trim()) {
        const newContent = content + (content.endsWith(' ') ? '' : ' ') + continuation.trim();
        
        dispatch({
          type: 'UPDATE_DOCUMENT_CONTENT',
          payload: {
            id: state.currentDocument.id,
            content: newContent
          }
        });

        // Focus and position cursor if textarea ref is available
        if (textareaRef?.current) {
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(newContent.length, newContent.length);
            }
          }, 100);
        }

        toast({
          title: "Story Continued",
          description: "AI has added to your story",
          duration: 3000
        });
      } else {
        toast({
          title: "No Content Generated",
          description: "AI couldn't generate a continuation. Try rephrasing your last sentence.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Continue writing failed:', error);
      toast({
        title: "Failed to Continue",
        description: error instanceof Error ? error.message : "Could not generate continuation",
        variant: "destructive"
      });
    }
  };

  const isButtonDisabled = disabled || isProcessing || !state.currentDocument?.content || !isCurrentProviderConfigured();

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleContinueWriting}
      disabled={isButtonDisabled}
      className="min-w-[140px]"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Continuing...
        </>
      ) : (
        <>
          <ArrowRight className="h-4 w-4 mr-2" />
          Continue Writing
        </>
      )}
    </Button>
  );
};

export default ContinueWritingButton;
