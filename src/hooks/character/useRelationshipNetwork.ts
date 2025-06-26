
import { useMemo } from 'react';
import { useWriting, CharacterRelationship } from '@/contexts/WritingContext';
import { RelationshipNetwork } from './types';

export const useRelationshipNetwork = () => {
  const { state, dispatch } = useWriting();

  const relationshipNetwork: RelationshipNetwork = useMemo(() => {
    const nodes = state.characters.map(char => ({
      id: char.id,
      name: char.name,
      group: char.tags?.[0] || 'main'
    }));

    const links = state.characters.flatMap(char =>
      char.relationships.map(rel => ({
        source: char.id,
        target: rel.targetCharacterId,
        type: rel.type,
        description: rel.description || ''
      }))
    );

    return { nodes, links };
  }, [state.characters]);

  const addRelationship = (
    characterId: string,
    targetCharacterId: string,
    type: string,
    description?: string
  ) => {
    const relationship: CharacterRelationship = {
      id: Date.now().toString(),
      targetCharacterId,
      type: type as CharacterRelationship['type'],
      description: description || ''
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

  return {
    relationshipNetwork,
    addRelationship
  };
};
