
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useWriting } from '@/contexts/WritingContext';

export interface PacingSegment {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  pace: 'very-slow' | 'slow' | 'medium' | 'fast' | 'very-fast';
  intensity: number; // 0-100
  type: 'action' | 'dialogue' | 'description' | 'reflection' | 'transition';
  suggestions: string[];
}

export interface PacingAnalysis {
  overallPace: 'consistent' | 'varied' | 'inconsistent';
  segments: PacingSegment[];
  pacingScore: number; // 0-100
  recommendations: string[];
  visualData: {
    labels: string[];
    intensityData: number[];
    paceData: number[];
  };
}

export const usePacingAnalysis = () => {
  const { state } = useWriting();
  const { processText } = useAI();
  const { execute, isLoading, error } = useAsyncOperation();
  const [pacingAnalysis, setPacingAnalysis] = useState<PacingAnalysis | null>(null);

  const analyzePacing = async (): Promise<PacingAnalysis | null> => {
    return execute(async () => {
      if (!state.currentDocument?.content) return null;

      const content = state.currentDocument.content;
      const segments = splitIntoSegments(content);
      
      const analysisPromises = segments.map(async (segment, index) => {
        const prompt = `Analyze the pacing of this text segment:

"${segment.text}"

Determine:
1. Pace: very-slow/slow/medium/fast/very-fast
2. Intensity: 0-100 (emotional/action intensity)
3. Type: action/dialogue/description/reflection/transition
4. Suggestions: How to improve pacing (if needed)

Format as:
Pace: [pace]
Intensity: [intensity]
Type: [type]
Suggestions: [suggestion1] | [suggestion2]`;

        const result = await processText(prompt, 'analyze-tone');
        const lines = result.split('\n');
        
        const pace = lines.find(l => l.startsWith('Pace:'))?.split(':')[1]?.trim() as PacingSegment['pace'] || 'medium';
        const intensity = parseInt(lines.find(l => l.startsWith('Intensity:'))?.split(':')[1]?.trim() || '50');
        const type = lines.find(l => l.startsWith('Type:'))?.split(':')[1]?.trim() as PacingSegment['type'] || 'description';
        const suggestions = lines.find(l => l.startsWith('Suggestions:'))?.split(':')[1]?.trim().split('|').map(s => s.trim()) || [];

        return {
          ...segment,
          pace,
          intensity,
          type,
          suggestions
        };
      });

      const analyzedSegments = await Promise.all(analysisPromises);
      
      // Generate overall analysis
      const overallPrompt = `Based on these pacing segments, provide an overall assessment:

${analyzedSegments.map((seg, i) => `Segment ${i + 1}: ${seg.pace} pace, ${seg.intensity} intensity, ${seg.type} type`).join('\n')}

Assess:
1. Overall pacing pattern (consistent/varied/inconsistent)
2. Pacing effectiveness score (0-100)
3. Recommendations for improvement

Format as:
Pattern: [pattern]
Score: [score]
Recommendations: [rec1] | [rec2] | [rec3]`;

      const overallResult = await processText(overallPrompt, 'analyze-tone');
      const overallLines = overallResult.split('\n');
      
      const overallPace = overallLines.find(l => l.startsWith('Pattern:'))?.split(':')[1]?.trim() as PacingAnalysis['overallPace'] || 'consistent';
      const pacingScore = parseInt(overallLines.find(l => l.startsWith('Score:'))?.split(':')[1]?.trim() || '75');
      const recommendations = overallLines.find(l => l.startsWith('Recommendations:'))?.split(':')[1]?.trim().split('|').map(r => r.trim()) || [];

      // Prepare visual data
      const labels = analyzedSegments.map((_, i) => `Segment ${i + 1}`);
      const intensityData = analyzedSegments.map(seg => seg.intensity);
      const paceData = analyzedSegments.map(seg => {
        const paceMap = { 'very-slow': 20, 'slow': 40, 'medium': 60, 'fast': 80, 'very-fast': 100 };
        return paceMap[seg.pace];
      });

      return {
        overallPace,
        segments: analyzedSegments,
        pacingScore,
        recommendations,
        visualData: {
          labels,
          intensityData,
          paceData
        }
      };
    }, 'analyze pacing');
  };

  const splitIntoSegments = (content: string): Omit<PacingSegment, 'pace' | 'intensity' | 'type' | 'suggestions'>[] => {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const segments: Omit<PacingSegment, 'pace' | 'intensity' | 'type' | 'suggestions'>[] = [];
    let currentIndex = 0;

    paragraphs.forEach((paragraph, index) => {
      const startIndex = currentIndex;
      const endIndex = currentIndex + paragraph.length;
      
      segments.push({
        id: `segment-${index}`,
        startIndex,
        endIndex,
        text: paragraph.substring(0, 500) // Limit text for analysis
      });
      
      currentIndex = endIndex + 2; // Account for \n\n
    });

    return segments;
  };

  const runPacingAnalysis = async () => {
    const analysis = await analyzePacing();
    if (analysis) {
      setPacingAnalysis(analysis);
    }
  };

  return {
    pacingAnalysis,
    isAnalyzing: isLoading,
    error,
    runPacingAnalysis
  };
};
