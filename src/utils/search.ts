
import { Document, Character, WorldElement } from '@/contexts/WritingContext';

export interface SearchResult {
  type: 'document' | 'character' | 'world-element';
  id: string;
  title: string;
  snippet: string;
  relevance: number;
}

export const searchContent = (
  query: string,
  documents: Document[],
  characters: Character[],
  worldElements: WorldElement[]
): SearchResult[] => {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  // Search documents
  documents.forEach(doc => {
    const titleMatch = doc.title.toLowerCase().includes(queryLower);
    const contentMatch = doc.content.toLowerCase().includes(queryLower);
    
    if (titleMatch || contentMatch) {
      const relevance = titleMatch ? 0.9 : 0.6;
      const snippetStart = doc.content.toLowerCase().indexOf(queryLower);
      const snippet = snippetStart >= 0 
        ? doc.content.substring(Math.max(0, snippetStart - 30), snippetStart + 100)
        : doc.content.substring(0, 100);
      
      results.push({
        type: 'document',
        id: doc.id,
        title: doc.title,
        snippet: snippet + '...',
        relevance
      });
    }
  });

  // Search characters
  characters.forEach(char => {
    const nameMatch = char.name.toLowerCase().includes(queryLower);
    const descMatch = char.description.toLowerCase().includes(queryLower);
    
    if (nameMatch || descMatch) {
      results.push({
        type: 'character',
        id: char.id,
        title: char.name,
        snippet: char.description.substring(0, 100) + '...',
        relevance: nameMatch ? 0.8 : 0.5
      });
    }
  });

  // Search world elements
  worldElements.forEach(element => {
    const nameMatch = element.name.toLowerCase().includes(queryLower);
    const descMatch = element.description.toLowerCase().includes(queryLower);
    
    if (nameMatch || descMatch) {
      results.push({
        type: 'world-element',
        id: element.id,
        title: element.name,
        snippet: element.description.substring(0, 100) + '...',
        relevance: nameMatch ? 0.8 : 0.5
      });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance);
};
