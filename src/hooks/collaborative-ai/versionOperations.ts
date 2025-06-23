
import { useAI } from '@/hooks/useAI';
import { VersionAnalysis, VersionChange } from './types';

export const useVersionOperations = () => {
  const { processText } = useAI();

  const analyzeVersionChanges = async (
    originalText: string,
    currentText: string
  ): Promise<VersionAnalysis> => {
    try {
      const prompt = `Compare these two text versions and analyze the changes:
        Original: "${originalText}"
        Current: "${currentText}"
        
        Identify specific changes and their impact on the text quality.`;

      await processText(prompt, 'analyze-tone');
      
      // Mock analysis for now - in real implementation this would parse AI response
      const mockChanges: VersionChange[] = [
        {
          type: 'addition',
          description: 'Added descriptive details',
          impact: 'positive'
        },
        {
          type: 'modification',
          description: 'Improved word choice',
          impact: 'positive'
        }
      ];

      return {
        improvements: mockChanges.filter(c => c.impact === 'positive').length,
        changes: mockChanges
      };
    } catch (error) {
      console.error('Failed to analyze version changes:', error);
      return { improvements: 0, changes: [] };
    }
  };

  return {
    analyzeVersionChanges
  };
};
