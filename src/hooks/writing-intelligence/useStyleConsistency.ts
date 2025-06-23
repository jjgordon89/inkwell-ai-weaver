import { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useWriting } from '@/contexts/WritingContext';

export interface StyleConsistencyIssue {
  id: string;
  type: 'voice' | 'tone' | 'vocabulary' | 'sentence-structure';
  description: string;
  location: {
    start: number;
    end: number;
    text: string;
  };
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface StyleProfile {
  averageSentenceLength: number;
  vocabularyComplexity: 'simple' | 'moderate' | 'complex';
  toneConsistency: number; // 0-100
  voiceStrength: number; // 0-100
  commonPatterns: string[];
}

export const useStyleConsistency = () => {
  const { state } = useWriting();
  const { processText } = useAI();
  const { execute, isLoading, error } = useAsyncOperation();
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<StyleConsistencyIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const analyzeStyleConsistency = async (content: string): Promise<StyleConsistencyIssue[]> => {
    const result = await execute(async () => {
      if (!content || content.length < 500) return [];

      const prompt = `Analyze this text for style consistency issues:

"${content}"

Identify issues in:
1. Voice consistency (first/third person shifts, narrative style changes)
2. Tone consistency (formal/informal, serious/light shifts)
3. Vocabulary level (complex/simple word mixing inappropriately)
4. Sentence structure patterns

For each issue found, provide:
- Type: voice/tone/vocabulary/sentence-structure
- Description: What's inconsistent
- Location: Quote the problematic text (max 50 chars)
- Severity: low/medium/high
- Suggestion: How to fix it

Format as:
ISSUE 1:
Type: [type]
Description: [description]
Location: "[quoted text]"
Severity: [severity]
Suggestion: [suggestion]
---`;

      const result = await processText(prompt, 'analyze-tone');
      const issues: StyleConsistencyIssue[] = [];
      
      const sections = result.split('---').filter(s => s.trim());
      
      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const type = lines.find(l => l.startsWith('Type:'))?.split(':')[1]?.trim();
        const description = lines.find(l => l.startsWith('Description:'))?.split(':')[1]?.trim();
        const location = lines.find(l => l.startsWith('Location:'))?.split(':')[1]?.trim().replace(/"/g, '');
        const severity = lines.find(l => l.startsWith('Severity:'))?.split(':')[1]?.trim();
        const suggestion = lines.find(l => l.startsWith('Suggestion:'))?.split(':')[1]?.trim();

        if (type && description && location && severity && suggestion) {
          const locationIndex = content.indexOf(location);
          issues.push({
            id: `style-issue-${index}`,
            type: type as StyleConsistencyIssue['type'],
            description,
            location: {
              start: locationIndex,
              end: locationIndex + location.length,
              text: location
            },
            severity: severity as StyleConsistencyIssue['severity'],
            suggestion
          });
        }
      });

      return issues;
    }, 'analyze style consistency');

    return result || [];
  };

  const buildStyleProfile = async (content: string): Promise<StyleProfile | null> => {
    return execute(async () => {
      if (!content || content.length < 200) return null;

      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const averageSentenceLength = sentences.reduce((acc, s) => acc + s.split(' ').length, 0) / sentences.length;
      
      const prompt = `Analyze the writing style of this text and provide a style profile:

"${content.substring(0, 1500)}"

Assess:
1. Vocabulary complexity (simple/moderate/complex)
2. Tone consistency (0-100 score)
3. Voice strength (0-100 score)
4. Common writing patterns

Format as:
Vocabulary: [complexity]
Tone Consistency: [score]
Voice Strength: [score]
Patterns: [pattern1], [pattern2], [pattern3]`;

      const result = await processText(prompt, 'analyze-tone');
      const lines = result.split('\n');
      
      const vocabulary = lines.find(l => l.startsWith('Vocabulary:'))?.split(':')[1]?.trim() as StyleProfile['vocabularyComplexity'] || 'moderate';
      const toneConsistency = parseInt(lines.find(l => l.startsWith('Tone Consistency:'))?.split(':')[1]?.trim() || '75');
      const voiceStrength = parseInt(lines.find(l => l.startsWith('Voice Strength:'))?.split(':')[1]?.trim() || '75');
      const patterns = lines.find(l => l.startsWith('Patterns:'))?.split(':')[1]?.trim().split(',').map(p => p.trim()) || [];

      return {
        averageSentenceLength,
        vocabularyComplexity: vocabulary,
        toneConsistency,
        voiceStrength,
        commonPatterns: patterns
      };
    }, 'build style profile');
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  // Auto-analyze when content changes (debounced)
  useEffect(() => {
    if (!isMonitoring || !state.currentDocument?.content) return;

    const timer = setTimeout(async () => {
      const content = state.currentDocument!.content;
      const issues = await analyzeStyleConsistency(content);
      const profile = await buildStyleProfile(content);
      
      setConsistencyIssues(issues);
      if (profile) setStyleProfile(profile);
    }, 2000);

    return () => clearTimeout(timer);
  }, [state.currentDocument?.content, isMonitoring]);

  return {
    styleProfile,
    consistencyIssues,
    isMonitoring,
    isAnalyzing: isLoading,
    error,
    analyzeStyleConsistency,
    buildStyleProfile,
    startMonitoring,
    stopMonitoring
  };
};
