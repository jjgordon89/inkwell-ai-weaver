
import { useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '../useAI';
import { validateAIInput, handleAIError, parseAIResponse } from '../ai/aiUtils';
import { InteractionSuggestion, VoiceConsistencyCheck } from './types';

export const useCharacterAI = () => {
  const { state } = useWriting();
  const { processText, isProcessing } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateInteractionSuggestions = async (): Promise<InteractionSuggestion[]> => {
    setIsGenerating(true);
    
    try {
      if (state.characters.length < 2) {
        throw new Error('Need at least 2 characters to generate interaction suggestions');
      }

      const charactersInfo = state.characters.map(char => ({
        name: char.name,
        personality: char.personality || '',
        occupation: char.occupation || '',
        relationships: char.relationships.map(rel => {
          const relatedChar = state.characters.find(c => c.id === rel.relatedCharacterId);
          return `${rel.relationshipType} with ${relatedChar?.name || 'Unknown'}`;
        })
      }));

      const prompt = `Based on these characters in a story:
${charactersInfo.map(char => `
Name: ${char.name}
Personality: ${char.personality}
Occupation: ${char.occupation}
Current relationships: ${char.relationships.join(', ') || 'None'}
`).join('\n')}

Generate 3-5 compelling character interaction suggestions. For each suggestion, provide:
- The two characters involved
- Interaction type (conflict, romance, friendship, rivalry, mentorship)
- A detailed description of the suggested interaction
- Context for why this interaction would be interesting

Format each suggestion as:
Character1: [name]
Character2: [name]
Type: [interaction type]
Description: [detailed description]
Context: [why this would be compelling]
---`;

      const result = await processText(prompt, 'improve');
      
      // Parse the AI response into interaction suggestions
      const suggestions: InteractionSuggestion[] = [];
      const sections = result.split('---').filter(s => s.trim());
      
      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const char1 = lines.find(l => l.startsWith('Character1:'))?.split(':')[1]?.trim();
        const char2 = lines.find(l => l.startsWith('Character2:'))?.split(':')[1]?.trim();
        const type = lines.find(l => l.startsWith('Type:'))?.split(':')[1]?.trim();
        const description = lines.find(l => l.startsWith('Description:'))?.split(':')[1]?.trim();
        const context = lines.find(l => l.startsWith('Context:'))?.split(':')[1]?.trim();

        if (char1 && char2 && type && description) {
          const char1Id = state.characters.find(c => c.name === char1)?.id;
          const char2Id = state.characters.find(c => c.name === char2)?.id;
          
          if (char1Id && char2Id) {
            suggestions.push({
              id: `suggestion-${index}`,
              character1Id: char1Id,
              character2Id: char2Id,
              type: type as InteractionSuggestion['type'],
              description: description || '',
              context: context || ''
            });
          }
        }
      });

      return suggestions;
    } catch (error) {
      throw handleAIError(error, 'generate interaction suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const checkVoiceConsistency = async (characterId: string): Promise<VoiceConsistencyCheck> => {
    setIsAnalyzing(true);
    
    try {
      const character = state.characters.find(c => c.id === characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      const documentContent = state.currentDocument?.content || '';
      validateAIInput(documentContent, 'voice consistency check');

      const prompt = `Analyze the voice consistency for the character "${character.name}" in this text:

Character Profile:
Name: ${character.name}
Personality: ${character.personality || 'Not specified'}
Age: ${character.age || 'Not specified'}
Occupation: ${character.occupation || 'Not specified'}
Background: ${character.backstory || 'Not specified'}

Text to analyze:
"${documentContent}"

Evaluate:
1. How consistently is this character's voice portrayed?
2. Are their dialogue patterns, vocabulary, and speech mannerisms consistent?
3. Do their actions align with their established personality?

Provide:
Consistency: [score 0-100]
Issues: [list specific inconsistencies found]
Suggestions: [specific recommendations for improvement]

Format as:
Consistency: [number]
Issues: [bullet points of issues]
Suggestions: [bullet points of suggestions]`;

      const result = await processText(prompt, 'analyze-tone');
      const parsed = parseAIResponse(result);
      
      return {
        characterId,
        consistency: parseInt(parsed.consistency as string) || 75,
        issues: parsed.issues ? 
          (parsed.issues as string).split('\n').filter(i => i.trim().length > 0) : 
          [],
        suggestions: parsed.suggestions ? 
          (parsed.suggestions as string).split('\n').filter(s => s.trim().length > 0) : 
          []
      };
    } catch (error) {
      throw handleAIError(error, 'check voice consistency');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    generateInteractionSuggestions,
    checkVoiceConsistency,
    isAnalyzing: isAnalyzing || isProcessing,
    isGenerating: isGenerating || isProcessing
  };
};
