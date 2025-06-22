
import { useCallback } from 'react';

export const useDocumentStructureAnalyzer = (
  onTriggerSuggestion: (suggestion: string, type: string) => void
) => {
  const analyzeDocumentStructure = useCallback((text: string) => {
    if (text.length < 200) return;
    
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const averageParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
    
    // Detect if paragraphs are getting too long
    if (averageParagraphLength > 500) {
      onTriggerSuggestion('Consider breaking up long paragraphs for better readability', 'structure_paragraphs');
    }
    
    // Detect lack of dialogue in story
    const dialogueCount = (text.match(/["'"]/g) || []).length;
    const wordCount = text.split(/\s+/).length;
    const dialogueRatio = dialogueCount / wordCount;
    
    if (wordCount > 500 && dialogueRatio < 0.02) {
      onTriggerSuggestion('Consider adding dialogue to bring your characters to life', 'structure_dialogue');
    }
  }, [onTriggerSuggestion]);

  return {
    analyzeDocumentStructure
  };
};
