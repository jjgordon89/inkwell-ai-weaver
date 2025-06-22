
import { Character, StoryArc } from '@/contexts/WritingContext';

export const applySuggestionAsNote = (
  suggestion: string,
  currentDocument: any,
  dispatch: (action: any) => void,
  toast: (options: any) => void
) => {
  if (!currentDocument) return;

  const noteText = `\n\n[AI Suggestion: ${suggestion}]\n\n`;
  const newContent = currentDocument.content + noteText;
  
  dispatch({
    type: 'UPDATE_DOCUMENT_CONTENT',
    payload: {
      id: currentDocument.id,
      content: newContent
    }
  });
  
  toast({
    title: "Suggestion Added",
    description: "AI suggestion added as a note to your document",
  });
};

export const applyStoryContinuation = (
  storyContinuation: string,
  currentDocument: any,
  dispatch: (action: any) => void,
  toast: (options: any) => void,
  clearContinuation: () => void
) => {
  if (!currentDocument || !storyContinuation) return;

  const newContent = currentDocument.content + '\n\n' + storyContinuation;
  
  dispatch({
    type: 'UPDATE_DOCUMENT_CONTENT',
    payload: {
      id: currentDocument.id,
      content: newContent
    }
  });
  
  toast({
    title: "Story Continuation Applied",
    description: "AI continuation added to your document",
  });
  
  clearContinuation();
};
