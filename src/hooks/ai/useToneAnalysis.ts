
import { useState } from 'react';
import { useAI } from '../useAI';
import { ToneAnalysis, WritingMetrics } from './types';
import { parseAIResponse, validateAIInput, handleAIError } from './aiUtils';

export const useToneAnalysis = () => {
  const { processText, isProcessing } = useAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeToneAndStyle = async (text: string): Promise<ToneAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      validateAIInput(text, 'tone analysis');

      const prompt = `Analyze the tone and style of this text:
"${text}"

Provide analysis in this format:
Tone: [primary tone - e.g., dark, hopeful, mysterious, humorous]
Confidence: [confidence level 0-100]
Style Notes: [writing style observations]
Suggestions: [3-4 specific suggestions for tone consistency or improvement]

Focus on emotional resonance, voice consistency, and narrative tone.`;

      const result = await processText(prompt, 'analyze-tone');
      const parsed = parseAIResponse(result);
      
      return {
        tone: parsed.tone as string || 'neutral',
        confidence: parseInt(parsed.confidence as string) || 70,
        suggestions: parsed.suggestions ? 
          (parsed.suggestions as string).split('\n').filter(s => s.trim().length > 0) : 
          []
      };
    } catch (error) {
      throw handleAIError(error, 'analyze tone and style');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeWritingQuality = async (text: string): Promise<WritingMetrics> => {
    setIsAnalyzing(true);
    try {
      validateAIInput(text, 'writing quality analysis');
      const result = await processText(text, 'analyze-writing-quality');
      const parsed = parseAIResponse(result);

      const readabilitySuggestions = (parsed.readabilitysuggestions as string || '')
        .split('\n')
        .map(s => s.trim().replace(/^- /, ''))
        .filter(Boolean);

      return {
        readability: {
          score: parseInt(parsed.readabilityscore as string, 10) || 0,
          level: parsed.readabilitylevel as string || 'N/A',
          suggestions: readabilitySuggestions,
        },
        sentenceVariety: parseInt(parsed.sentencevariety as string, 10) || 0,
        vocabularyRichness: parseInt(parsed.vocabularyrichness as string, 10) || 0,
        pacing: parsed.pacing as string || 'N/A',
        engagement: parseInt(parsed.engagement as string, 10) || 0,
      };
    } catch (error) {
      throw handleAIError(error, 'analyze writing quality');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeToneAndStyle,
    analyzeWritingQuality,
    isAnalyzing: isAnalyzing || isProcessing
  };
};
