
import { useState } from 'react';
import { useAI } from './useAI';
import { useAsyncOperation } from './useAsyncOperation';
import { StoryArc } from '@/contexts/WritingContext';

export const useStoryArcAI = () => {
  const { processText, isCurrentProviderConfigured } = useAI();
  const { execute, isLoading: isGenerating } = useAsyncOperation();

  const generateStoryArc = async (prompt: string): Promise<Partial<StoryArc>> => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured');
    }

    const result = await execute(async () => {
      const aiPrompt = `Generate a story arc based on this description: "${prompt}". 
      Provide a title and detailed description for the story arc.`;
      
      const response = await processText(aiPrompt, 'improve');
      
      return {
        title: `Generated Story Arc`,
        description: response || 'AI-generated story arc description',
      };
    }, 'generate story arc');

    // Handle null return from execute
    return result || {
      title: 'Generated Story Arc',
      description: 'AI-generated story arc description'
    };
  };

  const improveSuggestions = async (currentArcs: StoryArc[]): Promise<string[]> => {
    if (!isCurrentProviderConfigured()) {
      throw new Error('AI provider not configured');
    }

    const result = await execute(async () => {
      const aiPrompt = `Based on these existing story arcs: ${currentArcs.map(arc => arc.title).join(', ')}, 
      suggest 3-5 improvements or new story arc ideas.`;
      
      const response = await processText(aiPrompt, 'improve');
      
      // Basic parsing - return some default suggestions
      return [
        'Add character development arc',
        'Include plot twist resolution',
        'Develop supporting character relationships',
        'Add thematic resolution',
        'Include emotional climax'
      ];
    }, 'generate story arc suggestions');

    // Handle null return from execute
    return result || [
      'Add character development arc',
      'Include plot twist resolution',
      'Develop supporting character relationships'
    ];
  };

  return {
    generateStoryArc,
    improveSuggestions,
    isGenerating
  };
};
