
import React, { useState, useMemo } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWriting } from '@/contexts/WritingContext';
import CharacterForm from './characters/CharacterForm';
import CharacterCard from './characters/CharacterCard';
import type { Character } from '@/contexts/WritingContext';

const Characters = () => {
  const { state, dispatch } = useWriting();
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const filteredCharacters = useMemo(() => {
    return state.characters.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !filterTag || character.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    });
  }, [state.characters, searchTerm, filterTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    state.characters.forEach(character => {
      character.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [state.characters]);

  const handleAddCharacter = () => {
    setEditingCharacter(null);
    setShowForm(true);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  const handleDeleteCharacter = (characterId: string) => {
    dispatch({ type: 'DELETE_CHARACTER', payload: characterId });
  };

  const handleFormSubmit = (characterData: Omit<Character, 'id'>) => {
    if (editingCharacter) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: { ...characterData, id: editingCharacter.id }
      });
    } else {
      const newCharacter: Character = {
        ...characterData,
        id: crypto.randomUUID()
      };
      dispatch({ type: 'ADD_CHARACTER', payload: newCharacter });
    }
    setShowForm(false);
    setEditingCharacter(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCharacter(null);
  };

  if (showForm) {
    return (
      <CharacterForm
        character={editingCharacter}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Characters</h2>
        <Button onClick={handleAddCharacter}>
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterTag === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTag('')}
          >
            All
          </Button>
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={filterTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {filteredCharacters.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {state.characters.length === 0 
                ? "No characters created yet. Add your first character to get started!"
                : "No characters match your search criteria."
              }
            </p>
            {state.characters.length === 0 && (
              <Button onClick={handleAddCharacter}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Character
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={handleEditCharacter}
              onDelete={handleDeleteCharacter}
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Character Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Characters:</span>
            <span className="ml-2 font-semibold">{state.characters.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">With Descriptions:</span>
            <span className="ml-2 font-semibold">
              {state.characters.filter(c => c.description.length > 0).length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Tagged:</span>
            <span className="ml-2 font-semibold">
              {state.characters.filter(c => c.tags.length > 0).length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Tags:</span>
            <span className="ml-2 font-semibold">{allTags.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Characters;
