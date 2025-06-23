
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useWriting } from '@/contexts/WritingContext';

export interface CharacterArcProgress {
  characterId: string;
  characterName: string;
  arcStage: 'setup' | 'inciting-incident' | 'rising-action' | 'climax' | 'resolution';
  progressPercentage: number;
  keyDevelopments: string[];
  missedOpportunities: string[];
  suggestions: string[];
  consistencyScore: number; // 0-100
}

export interface CharacterArcInsight {
  id: string;
  type: 'development' | 'consistency' | 'opportunity' | 'regression';
  characterId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export const useCharacterArcTracking = () => {
  const { state } = useWriting();
  const { processText } = useAI();
  const { execute, isLoading, error } = useAsyncOperation();
  const [characterArcs, setCharacterArcs] = useState<CharacterArcProgress[]>([]);
  const [arcInsights, setArcInsights] = useState<CharacterArcInsight[]>([]);

  const analyzeCharacterArcs = async (): Promise<CharacterArcProgress[]> => {
    return execute(async () => {
      if (!state.currentDocument?.content || state.characters.length === 0) return [];

      const content = state.currentDocument.content;
      const arcs: CharacterArcProgress[] = [];

      for (const character of state.characters) {
        const prompt = `Analyze the character arc for "${character.name}" in this story:

Character Profile:
Name: ${character.name}
Description: ${character.description}
Personality: ${character.personality || 'Not specified'}
Backstory: ${character.backstory || 'Not specified'}

Story Content:
"${content}"

Assess:
1. Current arc stage (setup/inciting-incident/rising-action/climax/resolution)
2. Progress percentage (0-100)
3. Key developments so far (list 3-5)
4. Missed opportunities for growth
5. Suggestions for improvement
6. Consistency score (0-100)

Format as:
Stage: [stage]
Progress: [percentage]
Developments: [dev1] | [dev2] | [dev3]
Missed: [missed1] | [missed2]
Suggestions: [sug1] | [sug2] | [sug3]
Consistency: [score]`;

        const result = await processText(prompt, 'analyze-tone');
        const lines = result.split('\n');
        
        const stage = lines.find(l => l.startsWith('Stage:'))?.split(':')[1]?.trim() as CharacterArcProgress['arcStage'] || 'setup';
        const progress = parseInt(lines.find(l => l.startsWith('Progress:'))?.split(':')[1]?.trim() || '0');
        const developments = lines.find(l => l.startsWith('Developments:'))?.split(':')[1]?.trim().split('|').map(d => d.trim()) || [];
        const missed = lines.find(l => l.startsWith('Missed:'))?.split(':')[1]?.trim().split('|').map(m => m.trim()) || [];
        const suggestions = lines.find(l => l.startsWith('Suggestions:'))?.split(':')[1]?.trim().split('|').map(s => s.trim()) || [];
        const consistency = parseInt(lines.find(l => l.startsWith('Consistency:'))?.split(':')[1]?.trim() || '75');

        arcs.push({
          characterId: character.id,
          characterName: character.name,
          arcStage: stage,
          progressPercentage: progress,
          keyDevelopments: developments,
          missedOpportunities: missed,
          suggestions,
          consistencyScore: consistency
        });
      }

      return arcs;
    }, 'analyze character arcs');
  };

  const generateArcInsights = async (): Promise<CharacterArcInsight[]> => {
    return execute(async () => {
      if (characterArcs.length === 0) return [];

      const insights: CharacterArcInsight[] = [];
      
      characterArcs.forEach((arc, index) => {
        // Generate insights based on arc progress
        if (arc.progressPercentage < 30) {
          insights.push({
            id: `insight-${index}-development`,
            type: 'development',
            characterId: arc.characterId,
            title: `${arc.characterName} needs more development`,
            description: `Character arc is only ${arc.progressPercentage}% complete. Consider adding more defining moments.`,
            priority: 'medium',
            actionItems: arc.suggestions
          });
        }

        if (arc.consistencyScore < 60) {
          insights.push({
            id: `insight-${index}-consistency`,
            type: 'consistency',
            characterId: arc.characterId,
            title: `${arc.characterName} has consistency issues`,
            description: `Consistency score is ${arc.consistencyScore}%. Character behavior may be contradictory.`,
            priority: 'high',
            actionItems: [`Review ${arc.characterName}'s actions and dialogue`, 'Ensure personality traits remain consistent']
          });
        }

        if (arc.missedOpportunities.length > 0) {
          insights.push({
            id: `insight-${index}-opportunity`,
            type: 'opportunity',
            characterId: arc.characterId,
            title: `Growth opportunities for ${arc.characterName}`,
            description: `Several opportunities for character development have been identified.`,
            priority: 'low',
            actionItems: arc.missedOpportunities
          });
        }
      });

      return insights;
    }, 'generate arc insights');
  };

  const trackCharacterArcs = async () => {
    const arcs = await analyzeCharacterArcs();
    if (arcs) {
      setCharacterArcs(arcs);
      const insights = await generateArcInsights();
      if (insights) {
        setArcInsights(insights);
      }
    }
  };

  const dismissInsight = (id: string) => {
    setArcInsights(prev => prev.filter(insight => insight.id !== id));
  };

  return {
    characterArcs,
    arcInsights,
    isAnalyzing: isLoading,
    error,
    trackCharacterArcs,
    dismissInsight
  };
};
