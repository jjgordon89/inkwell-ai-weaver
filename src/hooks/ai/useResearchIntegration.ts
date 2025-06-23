
import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';

export interface ResearchSuggestion {
  id: string;
  researchId: string;
  targetDocumentId: string;
  researchTitle: string;
  targetTitle: string;
  relevantContent: string;
  suggestedIntegration: string;
  integrationPoint: string;
  confidence: number;
  category: 'historical' | 'technical' | 'character' | 'setting' | 'cultural';
}

export const useResearchIntegration = () => {
  const { state } = useProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<ResearchSuggestion[]>([]);

  const analyzeResearchIntegration = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const researchDocs = state.flatDocuments.filter(doc => doc.type === 'research-note');
      const manuscriptDocs = state.flatDocuments.filter(doc => 
        doc.type === 'chapter' || doc.type === 'scene'
      );
      
      const newSuggestions: ResearchSuggestion[] = [];
      
      researchDocs.forEach(research => {
        if (!research.content) return;
        
        // Extract key information from research
        const sentences = research.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keyFacts = sentences.slice(0, 5);
        
        manuscriptDocs.forEach(manuscript => {
          if (!manuscript.content) return;
          
          // Find potential integration points
          const paragraphs = manuscript.content.split('\n\n').filter(p => p.trim().length > 50);
          
          keyFacts.forEach((fact, factIndex) => {
            const factWords = fact.toLowerCase().match(/\b\w{4,}\b/g) || [];
            
            paragraphs.forEach((paragraph, paraIndex) => {
              const paraWords = paragraph.toLowerCase().match(/\b\w{4,}\b/g) || [];
              const commonWords = factWords.filter(word => paraWords.includes(word));
              
              if (commonWords.length >= 2) {
                const category = determineCategory(fact);
                
                newSuggestions.push({
                  id: `integration-${research.id}-${manuscript.id}-${factIndex}-${paraIndex}`,
                  researchId: research.id,
                  targetDocumentId: manuscript.id,
                  researchTitle: research.title,
                  targetTitle: manuscript.title,
                  relevantContent: fact.trim(),
                  suggestedIntegration: generateIntegrationSuggestion(fact, paragraph, category),
                  integrationPoint: paragraph.slice(0, 100) + '...',
                  confidence: Math.min(0.9, commonWords.length / Math.max(factWords.length, 1)),
                  category
                });
              }
            });
          });
        });
      });
      
      setSuggestions(
        newSuggestions
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 20)
      );
    } catch (error) {
      console.error('Failed to analyze research integration:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.flatDocuments]);

  const applyIntegration = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    // In a real implementation, this would modify the document content
  }, []);

  return {
    suggestions,
    isAnalyzing,
    analyzeResearchIntegration,
    applyIntegration
  };
};

function determineCategory(content: string): ResearchSuggestion['category'] {
  const lower = content.toLowerCase();
  if (lower.includes('history') || lower.includes('year') || lower.includes('century')) return 'historical';
  if (lower.includes('technology') || lower.includes('process') || lower.includes('method')) return 'technical';
  if (lower.includes('person') || lower.includes('character') || lower.includes('people')) return 'character';
  if (lower.includes('place') || lower.includes('location') || lower.includes('city')) return 'setting';
  return 'cultural';
}

function generateIntegrationSuggestion(fact: string, paragraph: string, category: ResearchSuggestion['category']): string {
  const suggestions = {
    historical: `Add historical context: "${fact}" could provide authentic period details.`,
    technical: `Incorporate technical accuracy: "${fact}" could enhance realism.`,
    character: `Develop character background: "${fact}" could inform character development.`,
    setting: `Enrich setting description: "${fact}" could add authentic location details.`,
    cultural: `Add cultural depth: "${fact}" could provide authentic cultural context.`
  };
  
  return suggestions[category];
}
