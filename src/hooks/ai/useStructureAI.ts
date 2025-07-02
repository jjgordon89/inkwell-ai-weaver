import { useState, useCallback } from 'react';
import { useAI } from '@/hooks/useAI';
import type { AIAction } from '@/hooks/ai/types';

// Define structure-specific AI actions for each document type
type StructureType = 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';

interface StructureAIAction {
  id: string;
  name: string;
  description: string;
  action: AIAction;
  icon?: string;
  structureTypes: StructureType[];
}

// Define AI actions specific to different structure types
const STRUCTURE_AI_ACTIONS: StructureAIAction[] = [
  // General actions for all structure types
  {
    id: 'improve',
    name: 'Improve Writing',
    description: 'Enhance clarity, flow, and readability while maintaining meaning',
    action: 'improve',
    structureTypes: ['novel', 'screenplay', 'research', 'poetry', 'academic', 'memoir', 'nonfiction']
  },
  {
    id: 'fix-grammar',
    name: 'Fix Grammar',
    description: 'Correct grammar, punctuation, and spelling errors',
    action: 'fix-grammar',
    structureTypes: ['novel', 'screenplay', 'research', 'poetry', 'academic', 'memoir', 'nonfiction']
  },
  {
    id: 'analyze-tone',
    name: 'Analyze Tone',
    description: 'Analyze the tone, mood, and style of your writing',
    action: 'analyze-tone',
    structureTypes: ['novel', 'screenplay', 'research', 'poetry', 'academic', 'memoir', 'nonfiction']
  },
  
  // Academic-specific actions
  {
    id: 'academic-thesis',
    name: 'Generate Thesis Statement',
    description: 'Create a clear, focused academic thesis statement',
    action: 'academic-thesis-statement',
    structureTypes: ['academic', 'research']
  },
  {
    id: 'academic-literature-review',
    name: 'Literature Review',
    description: 'Generate a literature review that synthesizes existing research',
    action: 'academic-literature-review',
    structureTypes: ['academic', 'research']
  },
  {
    id: 'academic-abstract',
    name: 'Generate Abstract',
    description: 'Create a comprehensive academic abstract',
    action: 'academic-abstract',
    structureTypes: ['academic', 'research']
  },
  {
    id: 'academic-research-question',
    name: 'Research Questions',
    description: 'Formulate focused research questions for academic inquiry',
    action: 'academic-research-question',
    structureTypes: ['academic', 'research']
  },
  {
    id: 'academic-methodology',
    name: 'Methodology Section',
    description: 'Develop a methodology section for your research',
    action: 'academic-methodology',
    structureTypes: ['academic', 'research']
  },
  
  // Memoir-specific actions
  {
    id: 'memoir-reflection',
    name: 'Reflective Passage',
    description: 'Develop a reflective passage exploring deeper significance',
    action: 'memoir-reflection',
    structureTypes: ['memoir']
  },
  {
    id: 'memoir-timeline',
    name: 'Life Timeline',
    description: 'Create a chronological timeline of key life events',
    action: 'memoir-timeline',
    structureTypes: ['memoir']
  },
  {
    id: 'memoir-character',
    name: 'Character Sketch',
    description: 'Create a nuanced portrait of an important person',
    action: 'memoir-character-sketch',
    structureTypes: ['memoir', 'novel']
  },
  {
    id: 'memoir-setting',
    name: 'Setting Description',
    description: 'Create a vivid description of a significant place',
    action: 'memoir-setting-description',
    structureTypes: ['memoir', 'novel']
  },
  {
    id: 'memoir-emotional',
    name: 'Emotional Insight',
    description: 'Explore the emotional landscape of an experience',
    action: 'memoir-emotional-insight',
    structureTypes: ['memoir']
  },
  
  // Nonfiction-specific actions
  {
    id: 'nonfiction-outline',
    name: 'Book Outline',
    description: 'Create a detailed chapter-by-chapter outline',
    action: 'nonfiction-outline',
    structureTypes: ['nonfiction', 'academic', 'research']
  },
  {
    id: 'nonfiction-research',
    name: 'Research Summary',
    description: 'Synthesize key findings and identify important sources',
    action: 'nonfiction-research-summary',
    structureTypes: ['nonfiction', 'academic', 'research']
  },
  {
    id: 'nonfiction-interview',
    name: 'Expert Interview Questions',
    description: 'Generate insightful questions for subject matter experts',
    action: 'nonfiction-expert-interview',
    structureTypes: ['nonfiction', 'academic', 'research']
  },
  {
    id: 'nonfiction-fact-check',
    name: 'Fact Check',
    description: 'Review content for factual accuracy and needed citations',
    action: 'nonfiction-fact-check',
    structureTypes: ['nonfiction', 'academic', 'research']
  },
  {
    id: 'nonfiction-conclusion',
    name: 'Conclusion',
    description: 'Create a powerful conclusion that synthesizes key points',
    action: 'nonfiction-conclusion',
    structureTypes: ['nonfiction', 'academic', 'research']
  },
  
  // Novel-specific actions
  {
    id: 'generate-plot',
    name: 'Generate Plot Elements',
    description: 'Create creative plot elements, conflicts, and developments',
    action: 'generate-plot',
    structureTypes: ['novel']
  },
  {
    id: 'continue-story',
    name: 'Continue Story',
    description: 'Continue the story naturally, maintaining tone and style',
    action: 'continue-story',
    structureTypes: ['novel', 'screenplay']
  },
  
  // Poetry-specific actions (note: could add more specific poetry actions in the future)
  {
    id: 'writing-prompt',
    name: 'Writing Prompt',
    description: 'Generate a creative writing prompt',
    action: 'writing-prompt',
    structureTypes: ['novel', 'poetry', 'screenplay']
  }
];

export interface StructureAIOperations {
  getActionsForStructure: (structureType: StructureType) => StructureAIAction[];
  processStructureSpecificText: (text: string, actionId: string) => Promise<string>;
  isProcessing: boolean;
  error: Error | null;
}

export const useStructureAI = (): StructureAIOperations => {
  const { processText, isProcessing } = useAI();
  const [error, setError] = useState<Error | null>(null);
  
  // Get available actions for a specific structure type
  const getActionsForStructure = useCallback((structureType: StructureType): StructureAIAction[] => {
    return STRUCTURE_AI_ACTIONS.filter(action => 
      action.structureTypes.includes(structureType)
    );
  }, []);
  
  // Process text using a structure-specific action
  const processStructureSpecificText = useCallback(async (text: string, actionId: string): Promise<string> => {
    try {
      setError(null);
      const actionConfig = STRUCTURE_AI_ACTIONS.find(action => action.id === actionId);
      
      if (!actionConfig) {
        throw new Error(`Unknown action ID: ${actionId}`);
      }
      
      return await processText(text, actionConfig.action);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    }
  }, [processText]);
  
  return {
    getActionsForStructure,
    processStructureSpecificText,
    isProcessing,
    error
  };
};
