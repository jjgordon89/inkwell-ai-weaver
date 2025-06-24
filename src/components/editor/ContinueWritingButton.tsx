
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Loader2 } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from '@/hooks/use-toast';
import { EditorTextareaRef } from './EditorTextarea';

interface ContinueWritingButtonProps {
  textareaRef?: React.RefObject<EditorTextareaRef>;
  className?: string;
}

const ContinueWritingButton: React.FC<ContinueWritingButtonProps> = ({
  textareaRef,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateTextCompletion } = useCollaborativeAI();
  const { state, dispatch } = useWriting();
  const { toast } = useToast();

  const handleContinueWriting = async () => {
    if (!state.currentDocument) {
      toast({
        title: "No Document",
        description: "Please select a document to continue writing.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const currentContent = state.currentDocument.content || '';
      
      // Get the last 200 characters for context
      const contextText = currentContent.slice(-200);
      
      if (contextText.trim().length === 0) {
        toast({
          title: "No Content",
          description: "Please write some content first, then use continue writing.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Generate continuation
      const continuation = await generateTextCompletion(contextText, '');
      
      if (continuation) {
        // Add the continuation to the document
        const newContent = currentContent + (currentContent.endsWith(' ') ? '' : ' ') + continuation;
        
        dispatch({
          type: 'UPDATE_DOCUMENT_CONTENT',
          payload: {
            id: state.currentDocument.id,
            content: newContent
          }
        });

        // Focus the textarea and move cursor to end if ref is available
        if (textareaRef?.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newContent.length, newContent.length);
        }

        toast({
          title: "Writing Continued",
          description: "AI has added new content to your document.",
        });
      } else {
        toast({
          title: "Unable to Continue",
          description: "The AI couldn't generate a continuation. Try adding more context.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Continue writing failed:', error);
      toast({
        title: "Error",
        description: "Failed to continue writing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleContinueWriting}
      disabled={isGenerating || !state.currentDocument}
      className={`${className}`}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Continuing...
        </>
      ) : (
        <>
          <Zap className="h-4 w-4 mr-2" />
          Continue Writing
        </>
      )}
    </Button>
  );
};

export default ContinueWritingButton;
