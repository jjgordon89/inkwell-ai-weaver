import { useState, useCallback } from 'react';

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  motivations: string[];
  flaws: string[];
  backstory: string;
  appearance: string;
  personality: string[];
  arc: string;
  relationships: string[];
  scenes: string[];
  development: number; // 0-100
  importance: 'high' | 'medium' | 'low';
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'char_1',
      name: 'Alex Morgan',
      role: 'protagonist',
      description: 'A determined detective with a mysterious past',
      motivations: ['justice', 'redemption'],
      flaws: ['stubborn', 'trust issues'],
      backstory: 'Former military officer turned detective after losing their partner',
      appearance: 'Tall, dark hair, piercing blue eyes with a scar on left cheek',
      personality: ['determined', 'analytical', 'protective'],
      arc: 'From isolated loner to trusted team leader',
      relationships: ['char_2'],
      scenes: ['scene_1', 'scene_3'],
      development: 75,
      importance: 'high',
      status: 'active',
      tags: ['detective', 'military', 'protagonist'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'char_2',
      name: 'Dr. Sarah Chen',
      role: 'supporting',
      description: 'Brilliant forensic scientist and Alex\'s closest ally',
      motivations: ['truth', 'scientific discovery'],
      flaws: ['perfectionist', 'workaholic'],
      backstory: 'Top of her class at medical school, chose forensics over surgery',
      appearance: 'Petite, black hair in a bun, always wearing lab coat',
      personality: ['intelligent', 'meticulous', 'loyal'],
      arc: 'Learning to balance work and personal life',
      relationships: ['char_1'],
      scenes: ['scene_2', 'scene_4'],
      development: 60,
      importance: 'high',
      status: 'active',
      tags: ['scientist', 'forensics', 'ally'],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'char_3',
      name: 'Marcus Vale',
      role: 'antagonist',
      description: 'Charismatic crime lord with political connections',
      motivations: ['power', 'control'],
      flaws: ['arrogant', 'ruthless'],
      backstory: 'Rose from poverty through crime, now controls the city\'s underworld',
      appearance: 'Impeccably dressed, silver hair, cold gray eyes',
      personality: ['manipulative', 'intelligent', 'ruthless'],
      arc: 'Fall from power as his empire crumbles',
      relationships: [],
      scenes: ['scene_5'],
      development: 45,
      importance: 'high',
      status: 'active',
      tags: ['antagonist', 'crime', 'politician'],
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-12')
    }
  ]);

  const addCharacter = useCallback((character: Character) => {
    setCharacters(prev => [...prev, character]);
  }, []);

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setCharacters(prev => 
      prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
    );
  }, []);

  const deleteCharacter = useCallback((characterId: string) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
  }, []);

  const getCharacterById = useCallback((id: string) => {
    return characters.find(char => char.id === id);
  }, [characters]);

  const getCharactersByRole = useCallback((role: Character['role']) => {
    return characters.filter(char => char.role === role);
  }, [characters]);

  const getCharactersByImportance = useCallback((importance: Character['importance']) => {
    return characters.filter(char => char.importance === importance);
  }, [characters]);

  return {
    characters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterById,
    getCharactersByRole,
    getCharactersByImportance
  };
};

export type { Character };
