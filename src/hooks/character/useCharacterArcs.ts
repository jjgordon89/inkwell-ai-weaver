
import { useState } from 'react';
import { CharacterArc } from './types';

export const useCharacterArcs = () => {
  const [characterArcs, setCharacterArcs] = useState<CharacterArc[]>([]);

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
    characterArcs,
    addCharacterArc,
    updateCharacterArc,
    getCharacterArcs
  };
};
