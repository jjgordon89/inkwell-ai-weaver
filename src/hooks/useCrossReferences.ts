
import { useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';

interface Connection {
  type: 'character-arc' | 'character-world' | 'arc-world';
  from: any;
  to: any;
  relationship: string;
}

export const useCrossReferences = () => {
  const { state } = useWriting();
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to find references to a character in the current document
  const findCharacterReferences = (characterName: string): number => {
    if (!state.currentDocument) return 0;
    const content = state.currentDocument.content.toLowerCase();
    const name = characterName.toLowerCase();
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  };

  // Helper function to find connections between story elements
  const findConnections = (): Connection[] => {
    const connections: Connection[] = [];

    // Characters mentioned in story arcs
    state.storyArcs.forEach(arc => {
      state.characters.forEach(character => {
        if (arc.description.toLowerCase().includes(character.name.toLowerCase())) {
          connections.push({
            type: 'character-arc',
            from: character,
            to: arc,
            relationship: 'appears in'
          });
        }
      });
    });

    // Characters connected to world elements
    state.worldElements.forEach(element => {
      state.characters.forEach(character => {
        if (element.description.toLowerCase().includes(character.name.toLowerCase()) ||
            character.description.toLowerCase().includes(element.name.toLowerCase())) {
          connections.push({
            type: 'character-world',
            from: character,
            to: element,
            relationship: 'connected to'
          });
        }
      });
    });

    // Story arcs connected to world elements
    state.storyArcs.forEach(arc => {
      state.worldElements.forEach(element => {
        if (arc.description.toLowerCase().includes(element.name.toLowerCase())) {
          connections.push({
            type: 'arc-world',
            from: arc,
            to: element,
            relationship: 'takes place in'
          });
        }
      });
    });

    return connections;
  };

  const connections = findConnections();
  const filteredConnections = connections.filter(conn => 
    searchTerm === '' ||
    conn.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conn.to.name || conn.to.title).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    state,
    searchTerm,
    setSearchTerm,
    findCharacterReferences,
    connections,
    filteredConnections
  };
};
