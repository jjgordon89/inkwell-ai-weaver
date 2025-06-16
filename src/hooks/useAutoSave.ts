
import { useEffect, useRef } from 'react';
import { useWriting } from '@/contexts/WritingContext';

export const useAutoSave = (delay: number = 2000) => {
  const { state } = useWriting();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (state.currentDocument) {
        // Save to localStorage as a simple persistence layer
        const savedDocuments = JSON.parse(
          localStorage.getItem('manuscript-documents') || '[]'
        );
        
        const existingIndex = savedDocuments.findIndex(
          (doc: { id: string }) => doc.id === state.currentDocument?.id
        );
        
        if (existingIndex >= 0) {
          savedDocuments[existingIndex] = state.currentDocument;
        } else {
          savedDocuments.push(state.currentDocument);
        }
        
        localStorage.setItem('manuscript-documents', JSON.stringify(savedDocuments));
        console.log('Document auto-saved:', state.currentDocument.title);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.currentDocument, delay]);
};
