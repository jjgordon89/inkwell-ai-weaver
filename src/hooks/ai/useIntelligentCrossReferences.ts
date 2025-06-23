
import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';

export interface IntelligentConnection {
  id: string;
  fromId: string;
  toId: string;
  fromType: 'chapter' | 'character' | 'plot-point' | 'research-note';
  toType: 'chapter' | 'character' | 'plot-point' | 'research-note';
  fromTitle: string;
  toTitle: string;
  connectionType: 'character-appears' | 'plot-development' | 'thematic-link' | 'research-support' | 'narrative-flow';
  strength: number; // 0-1
  context: string;
  suggestions: string[];
  aiGenerated: boolean;
}

export const useIntelligentCrossReferences = () => {
  const { state: projectState } = useProject();
  const { state: writingState } = useWriting();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connections, setConnections] = useState<IntelligentConnection[]>([]);

  const analyzeConnections = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newConnections: IntelligentConnection[] = [];
      
      // Analyze character appearances across chapters
      writingState.characters.forEach(character => {
        const appearances = projectState.flatDocuments.filter(doc => 
          doc.content?.toLowerCase().includes(character.name.toLowerCase()) && 
          (doc.type === 'chapter' || doc.type === 'scene')
        );
        
        if (appearances.length > 1) {
          for (let i = 0; i < appearances.length - 1; i++) {
            const current = appearances[i];
            const next = appearances[i + 1];
            
            newConnections.push({
              id: `char-${character.id}-${current.id}-${next.id}`,
              fromId: current.id,
              toId: next.id,
              fromType: 'chapter',
              toType: 'chapter',
              fromTitle: current.title,
              toTitle: next.title,
              connectionType: 'character-appears',
              strength: 0.8,
              context: `${character.name} appears in both chapters`,
              suggestions: [
                `Track ${character.name}'s character development between these chapters`,
                `Consider adding transitional scenes for ${character.name}`,
                `Ensure consistent voice and motivation for ${character.name}`
              ],
              aiGenerated: true
            });
          }
        }
      });
      
      // Analyze plot point connections
      writingState.storyArcs.forEach(arc => {
        const relatedDocs = projectState.flatDocuments.filter(doc =>
          doc.content?.toLowerCase().includes(arc.title.toLowerCase()) ||
          arc.description.toLowerCase().includes(doc.title.toLowerCase())
        );
        
        relatedDocs.forEach(doc => {
          newConnections.push({
            id: `arc-${arc.id}-${doc.id}`,
            fromId: arc.id,
            toId: doc.id,
            fromType: 'plot-point',
            toType: doc.type === 'research-note' ? 'research-note' : 'chapter',
            fromTitle: arc.title,
            toTitle: doc.title,
            connectionType: 'plot-development',
            strength: 0.7,
            context: `Plot arc "${arc.title}" connects to this content`,
            suggestions: [
              'Strengthen the connection between plot arc and narrative',
              'Consider adding foreshadowing elements',
              'Verify plot consistency and pacing'
            ],
            aiGenerated: true
          });
        });
      });
      
      // Analyze research integration opportunities
      const researchDocs = projectState.flatDocuments.filter(doc => doc.type === 'research-note');
      const manuscriptDocs = projectState.flatDocuments.filter(doc => 
        doc.type === 'chapter' || doc.type === 'scene'
      );
      
      researchDocs.forEach(research => {
        if (!research.content) return;
        
        const keywords = research.content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
        
        manuscriptDocs.forEach(manuscript => {
          if (!manuscript.content) return;
          
          const commonKeywords = uniqueKeywords.filter(keyword =>
            manuscript.content!.toLowerCase().includes(keyword)
          );
          
          if (commonKeywords.length > 2) {
            newConnections.push({
              id: `research-${research.id}-${manuscript.id}`,
              fromId: research.id,
              toId: manuscript.id,
              fromType: 'research-note',
              toType: 'chapter',
              fromTitle: research.title,
              toTitle: manuscript.title,
              connectionType: 'research-support',
              strength: Math.min(0.9, commonKeywords.length / 5),
              context: `Research supports narrative with ${commonKeywords.length} related concepts`,
              suggestions: [
                'Incorporate more research details into the narrative',
                'Add authentic details from research notes',
                'Verify historical/factual accuracy'
              ],
              aiGenerated: true
            });
          }
        });
      });
      
      setConnections(newConnections.sort((a, b) => b.strength - a.strength));
    } catch (error) {
      console.error('Failed to analyze connections:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [projectState.flatDocuments, writingState.characters, writingState.storyArcs]);

  const acceptConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, aiGenerated: false }
        : conn
    ));
  }, []);

  const rejectConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  }, []);

  const getConnectionsByType = useCallback((type: IntelligentConnection['connectionType']) => {
    return connections.filter(conn => conn.connectionType === type);
  }, [connections]);

  return {
    connections,
    isAnalyzing,
    analyzeConnections,
    acceptConnection,
    rejectConnection,
    getConnectionsByType
  };
};
