
import { useState, useCallback, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'character' | 'story-arc' | 'world-element';
  relevanceScore: number;
  matchedPhrases: string[];
  context: string;
}

export const useSemanticSearch = () => {
  const { state: projectState } = useProject();
  const { state: writingState } = useWriting();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Create searchable content index
  const searchIndex = useMemo(() => {
    const index: Array<{
      id: string;
      title: string;
      content: string;
      type: SearchResult['type'];
      tags?: string[];
    }> = [];

    // Add documents
    projectState.flatDocuments.forEach(doc => {
      if (doc.content) {
        index.push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          type: 'document',
          tags: doc.labels
        });
      }
    });

    // Add characters
    writingState.characters.forEach(char => {
      index.push({
        id: char.id,
        title: char.name,
        content: `${char.description} ${char.notes} ${char.backstory || ''}`,
        type: 'character',
        tags: char.tags
      });
    });

    // Add story arcs
    writingState.storyArcs.forEach(arc => {
      index.push({
        id: arc.id,
        title: arc.title,
        content: arc.description,
        type: 'story-arc'
      });
    });

    // Add world elements
    writingState.worldElements.forEach(element => {
      index.push({
        id: element.id,
        title: element.name,
        content: element.description,
        type: 'world-element'
      });
    });

    return index;
  }, [projectState.flatDocuments, writingState.characters, writingState.storyArcs, writingState.worldElements]);

  const performSemanticSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    setIsSearching(true);
    
    try {
      // Simulate AI-powered semantic search with enhanced text analysis
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const queryLower = query.toLowerCase();
      const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
      
      const results = searchIndex.map(item => {
        const titleLower = item.title.toLowerCase();
        const contentLower = item.content.toLowerCase();
        
        let score = 0;
        const matchedPhrases: string[] = [];
        
        // Exact title match gets highest score
        if (titleLower.includes(queryLower)) {
          score += 100;
          matchedPhrases.push(item.title);
        }
        
        // Partial title matches
        queryTerms.forEach(term => {
          if (titleLower.includes(term)) {
            score += 50;
            if (!matchedPhrases.includes(item.title)) {
              matchedPhrases.push(item.title);
            }
          }
        });
        
        // Content matches with context
        queryTerms.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          const matches = contentLower.match(regex);
          if (matches) {
            score += matches.length * 10;
            
            // Extract context around matches
            const contextRegex = new RegExp(`(.{0,50}\\b${term}\\b.{0,50})`, 'gi');
            const contextMatches = item.content.match(contextRegex);
            if (contextMatches) {
              matchedPhrases.push(...contextMatches.slice(0, 2));
            }
          }
        });
        
        // Tag matches
        if (item.tags) {
          item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(queryLower)) {
              score += 30;
              matchedPhrases.push(`Tag: ${tag}`);
            }
          });
        }
        
        // Get context snippet
        const firstMatch = item.content.toLowerCase().indexOf(queryTerms[0] || queryLower);
        const contextStart = Math.max(0, firstMatch - 100);
        const context = item.content.slice(contextStart, contextStart + 200);
        
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type,
          relevanceScore: score,
          matchedPhrases: matchedPhrases.slice(0, 3),
          context: score > 0 ? context : ''
        };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);
      
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchIndex]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    performSemanticSearch,
    clearSearch,
    searchIndex: searchIndex.length
  };
};
