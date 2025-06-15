
import { useState, useMemo } from 'react';
import { useWriting, Character, CharacterRelationship } from '@/contexts/WritingContext';
import { useAI } from './useAI';
import { validateAIInput, handleAIError, parseAIResponse } from './ai/aiUtils';

export interface CharacterArc {
  id: string;
  characterId: string;
  title: string;
  description: string;
  startChapter?: string;
  endChapter?: string;
  keyMoments: string[];
  completed: boolean;
}

export interface VoiceConsistencyCheck {
  characterId: string;
  consistency: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface InteractionSuggestion {
  id: string;
  character1Id: string;
  character2Id: string;
  type: 'conflict' | 'romance' | 'friendship' | 'rivalry' | 'mentorship';
  description: string;
  context: string;
}

export const useCharacterRelationships = () => {
  const { state, dispatch } = useWriting();
  const { processText, isProcessing } = useAI();
  
  const [characterArcs, setCharacterArcs] = useState<CharacterArc[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Create relationship network data for visualization
  const relationshipNetwork = useMemo(() => {
    const nodes = state.characters.map(char => ({
      id: char.id,
      name: char.name,
      group: char.tags?.[0] || 'main'
    }));

    const links = state.characters.flatMap(char =>
      char.relationships.map(rel => ({
        source: char.id,
        target: rel.relatedCharacterId,
        type: rel.relationshipType,
        description: rel.description || ''
      }))
    );

    return { nodes, links };
  }, [state.characters]);

  // Add or update character relationship
  const addRelationship = (
    characterId: string,
    relatedCharacterId: string,
    relationshipType: string,
    description?: string
  ) => {
    const relationship: CharacterRelationship = {
      id: Date.now().toString(),
      characterId,
      relatedCharacterId,
      relationshipType,
      description
    };

    const character = state.characters.find(c => c.id === characterId);
    if (character) {
      const updatedCharacter = {
        ...character,
        relationships: [...character.relationships, relationship]
      };
      dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
    }
  };

  // Generate character interaction suggestions
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

  // Check voice consistency for a character
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

  // Track character arc progress
  const addCharacterArc = (arc: Omit<CharacterArc, 'id'>) => {
    const newArc: CharacterArc = {
      ...arc,
      id: Date.now().toString()
    };
    setCharacterArcs(prev => [...prev, newArc]);
  };

  const updateCharacterArc = (arcId: string, updates: Partial<CharacterArc>) => {
    setCharacterArcs(prev => 
      prev.map(arc => arc.id === arcId ? { ...arc, ...updates } : arc)
    );
  };

  const getCharacterArcs = (characterId: string) => {
    return characterArcs.filter(arc => arc.characterId === characterId);
  };

  return {
    // Relationship management
    relationshipNetwork,
    addRelationship,
    
    // Character arcs
    characterArcs,
    addCharacterArc,
    updateCharacterArc,
    getCharacterArcs,
    
    // AI-powered features
    generateInteractionSuggestions,
    checkVoiceConsistency,
    
    // State
    isAnalyzing: isAnalyzing || isProcessing,
    isGenerating: isGenerating || isProcessing
  };
};
