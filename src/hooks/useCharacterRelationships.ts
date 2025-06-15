
import { useCharacterArcs } from './character/useCharacterArcs';
import { useRelationshipNetwork } from './character/useRelationshipNetwork';
import { useCharacterAI } from './character/useCharacterAI';

export type {
  CharacterArc,
  VoiceConsistencyCheck,
  InteractionSuggestion
} from './character/types';

export const useCharacterRelationships = () => {
  const {
    characterArcs,
    addCharacterArc,
    updateCharacterArc,
    getCharacterArcs
  } = useCharacterArcs();

  const {
    relationshipNetwork,
    addRelationship
  } = useRelationshipNetwork();

  const {
    generateInteractionSuggestions,
    checkVoiceConsistency,
    isAnalyzing,
    isGenerating
  } = useCharacterAI();

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
    isAnalyzing,
    isGenerating
  };
};
