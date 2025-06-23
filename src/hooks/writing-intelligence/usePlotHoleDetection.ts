import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useWriting } from '@/contexts/WritingContext';

export interface PlotHole {
  id: string;
  type: 'continuity' | 'character' | 'timeline' | 'logic' | 'world-building';
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  location: string;
  suggestions: string[];
  relatedElements: string[];
}

export const usePlotHoleDetection = () => {
  const { state } = useWriting();
  const { processText } = useAI();
  const { execute, isLoading, error } = useAsyncOperation();
  const [plotHoles, setPlotHoles] = useState<PlotHole[]>([]);

  const detectPlotHoles = async (): Promise<PlotHole[]> => {
    const result = await execute(async () => {
      if (!state.currentDocument?.content) return [];

      const content = state.currentDocument.content;
      const characters = state.characters.map(c => c.name).join(', ');
      const worldElements = state.worldElements.map(w => w.name).join(', ');

      const prompt = `Analyze this story for plot holes and inconsistencies:

Story Content:
"${content}"

Characters: ${characters}
World Elements: ${worldElements}

Look for:
1. Continuity errors (events that contradict each other)
2. Character inconsistencies (behavior that doesn't match established personality)
3. Timeline issues (events that don't align chronologically)
4. Logic problems (unrealistic or impossible situations)
5. World-building inconsistencies (rules that are broken)

For each issue found, provide:
- Type: continuity/character/timeline/logic/world-building
- Title: Brief summary
- Description: Detailed explanation
- Severity: minor/moderate/major
- Location: Where in the story this occurs
- Suggestions: How to fix it (2-3 options)

Format as:
PLOT HOLE 1:
Type: [type]
Title: [title]
Description: [description]
Severity: [severity]
Location: [location]
Suggestions: [suggestion1] | [suggestion2] | [suggestion3]
---`;

      const result = await processText(prompt, 'analyze-tone');
      const holes: PlotHole[] = [];
      
      const sections = result.split('---').filter(s => s.trim());
      
      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const type = lines.find(l => l.startsWith('Type:'))?.split(':')[1]?.trim();
        const title = lines.find(l => l.startsWith('Title:'))?.split(':')[1]?.trim();
        const description = lines.find(l => l.startsWith('Description:'))?.split(':')[1]?.trim();
        const severity = lines.find(l => l.startsWith('Severity:'))?.split(':')[1]?.trim();
        const location = lines.find(l => l.startsWith('Location:'))?.split(':')[1]?.trim();
        const suggestions = lines.find(l => l.startsWith('Suggestions:'))?.split(':')[1]?.trim().split('|').map(s => s.trim());

        if (type && title && description && severity && location && suggestions) {
          holes.push({
            id: `plot-hole-${index}`,
            type: type as PlotHole['type'],
            title,
            description,
            severity: severity as PlotHole['severity'],
            location,
            suggestions,
            relatedElements: []
          });
        }
      });

      return holes;
    }, 'detect plot holes');

    return result || [];
  };

  const runPlotHoleDetection = async () => {
    const holes = await detectPlotHoles();
    setPlotHoles(holes);
  };

  const dismissPlotHole = (id: string) => {
    setPlotHoles(prev => prev.filter(hole => hole.id !== id));
  };

  return {
    plotHoles,
    isAnalyzing: isLoading,
    error,
    runPlotHoleDetection,
    dismissPlotHole
  };
};
