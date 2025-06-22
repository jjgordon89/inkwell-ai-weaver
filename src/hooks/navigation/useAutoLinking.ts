
import { useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';

export interface AutoLink {
  id: string;
  text: string;
  type: 'character' | 'location' | 'plot-point' | 'scene';
  targetId: string;
  confidence: number;
  context: string;
}

export const useAutoLinking = (documentId?: string) => {
  const { state: projectState } = useProject();
  const { state: writingState } = useWriting();

  const currentDocument = useMemo(() => {
    if (!documentId) return projectState.flatDocuments.find(doc => doc.id === projectState.activeDocumentId);
    return projectState.flatDocuments.find(doc => doc.id === documentId);
  }, [documentId, projectState.flatDocuments, projectState.activeDocumentId]);

  const autoLinks = useMemo(() => {
    if (!currentDocument?.content) return [];

    const links: AutoLink[] = [];
    const content = currentDocument.content;

    // Find character mentions
    writingState.characters.forEach(character => {
      const regex = new RegExp(`\\b${character.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        let lastIndex = 0;
        matches.forEach((match, index) => {
          const matchIndex = content.toLowerCase().indexOf(match.toLowerCase(), lastIndex);
          if (matchIndex !== -1) {
            const contextStart = Math.max(0, matchIndex - 50);
            const contextEnd = Math.min(content.length, matchIndex + match.length + 50);
            
            links.push({
              id: `char-${character.id}-${index}`,
              text: match,
              type: 'character',
              targetId: character.id,
              confidence: 0.9,
              context: content.slice(contextStart, contextEnd)
            });
            
            lastIndex = matchIndex + match.length;
          }
        });
      }
    });

    // Find location mentions from world elements
    writingState.worldElements
      .filter(element => element.type === 'location')
      .forEach(location => {
        const regex = new RegExp(`\\b${location.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          matches.forEach((match, index) => {
            const matchIndex = content.indexOf(match);
            if (matchIndex !== -1) {
              const contextStart = Math.max(0, matchIndex - 50);
              const contextEnd = Math.min(content.length, matchIndex + match.length + 50);
              
              links.push({
                id: `loc-${location.id}-${index}`,
                text: match,
                type: 'location',
                targetId: location.id,
                confidence: 0.8,
                context: content.slice(contextStart, contextEnd)
              });
            }
          });
        }
      });

    // Find related scenes by searching for similar content in other documents
    const relatedScenes = projectState.flatDocuments
      .filter(doc => doc.id !== currentDocument.id && doc.content && doc.type === 'scene')
      .map(doc => {
        const currentWords = content.toLowerCase().match(/\b\w+\b/g) || [];
        const docWords = doc.content!.toLowerCase().match(/\b\w+\b/g) || [];
        
        // Calculate similarity based on common words
        const commonWords = currentWords.filter(word => 
          word.length > 3 && docWords.includes(word)
        );
        
        const similarity = commonWords.length / Math.max(currentWords.length, docWords.length);
        
        return {
          document: doc,
          similarity,
          commonWords: [...new Set(commonWords)].slice(0, 5)
        };
      })
      .filter(item => item.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    relatedScenes.forEach((scene, index) => {
      links.push({
        id: `scene-${scene.document.id}-${index}`,
        text: scene.document.title,
        type: 'scene',
        targetId: scene.document.id,
        confidence: Math.min(0.9, scene.similarity * 2),
        context: `Related scene with ${scene.commonWords.length} common elements: ${scene.commonWords.join(', ')}`
      });
    });

    return links.sort((a, b) => b.confidence - a.confidence);
  }, [currentDocument, writingState.characters, writingState.worldElements, projectState.flatDocuments]);

  const getLinksByType = (type: AutoLink['type']) => {
    return autoLinks.filter(link => link.type === type);
  };

  const getHighConfidenceLinks = (threshold = 0.7) => {
    return autoLinks.filter(link => link.confidence >= threshold);
  };

  return {
    autoLinks,
    getLinksByType,
    getHighConfidenceLinks,
    currentDocument
  };
};
