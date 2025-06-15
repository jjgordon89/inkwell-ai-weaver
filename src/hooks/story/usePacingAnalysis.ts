
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import type { Scene, PacingAnalysis } from './types';

export const usePacingAnalysis = () => {
  const { processText, isProcessing } = useAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePacing = async (scenes: Scene[], content: string): Promise<PacingAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      const sceneInfo = scenes.map(scene => 
        `Act ${scene.act}, Scene: ${scene.title} - Pace: ${scene.paceType}, Tension: ${scene.tensionLevel}/10`
      ).join('\n');

      const prompt = `Analyze the pacing of this story based on the following scene structure:
${sceneInfo}

Story content excerpt:
${content.substring(0, 2000)}...

Please provide:
1. Overall pacing assessment (slow/moderate/fast/varied)
2. Act-by-act pacing scores (1-10 scale)
3. 3-5 specific recommendations for improving pacing

Format your response as:
Overall: [assessment]
Act 1 Pacing: [score]
Act 2 Pacing: [score]
Act 3 Pacing: [score]
Recommendations:
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]`;

      const result = await processText(prompt, 'analyze');
      
      // Parse the AI response
      const lines = result.split('\n');
      const overallMatch = lines.find(line => line.startsWith('Overall:'));
      const act1Match = lines.find(line => line.startsWith('Act 1 Pacing:'));
      const act2Match = lines.find(line => line.startsWith('Act 2 Pacing:'));
      const act3Match = lines.find(line => line.startsWith('Act 3 Pacing:'));
      
      const recommendationStart = lines.findIndex(line => line.includes('Recommendations:'));
      const recommendations = lines.slice(recommendationStart + 1)
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());

      const overall = overallMatch?.split(':')[1]?.trim() as PacingAnalysis['overallPace'] || 'moderate';
      const act1Score = parseInt(act1Match?.split(':')[1]?.trim() || '5');
      const act2Score = parseInt(act2Match?.split(':')[1]?.trim() || '5');
      const act3Score = parseInt(act3Match?.split(':')[1]?.trim() || '5');

      return {
        overallPace: overall,
        actPacing: {
          act1: act1Score,
          act2: act2Score,
          act3: act3Score
        },
        tensionCurve: scenes.map(scene => scene.tensionLevel),
        recommendations: recommendations.length > 0 ? recommendations : [
          'Consider varying the pacing between scenes',
          'Build tension gradually toward climactic moments',
          'Allow for breathing room after intense scenes'
        ]
      };
    } catch (error) {
      console.error('Failed to analyze pacing:', error);
      throw new Error('Failed to analyze story pacing');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzePacing,
    isAnalyzing: isAnalyzing || isProcessing
  };
};
