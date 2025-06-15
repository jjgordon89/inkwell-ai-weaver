
import React, { useState, useMemo } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWriting } from '@/contexts/WritingContext';
import { Character } from '@/contexts/WritingContext';
import CharacterSearch from './characters/CharacterSearch';
import CharacterForm from './characters/CharacterForm';
import CharacterCard from './characters/CharacterCard';

const Characters = () => {
  const { state, dispatch } = useWriting();
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all available tags from characters
  const availableTags = useMemo(() => {
    const allTags = state.characters.flatMap(char => char.tags || []);
    return Array.from(new Set(allTags)).sort();
  }, [state.characters]);

  // Filter characters based on search and tags
  const filteredCharacters = useMemo(() => {
    return state.characters.filter(character => {
      const matchesSearch = searchTerm === '' || 
        character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.personality?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => character.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [state.characters, searchTerm, selectedTags]);

  const resetForm = () => {
    setEditingCharacter(null);
    setIsAddingCharacter(false);
  };

  const handleSubmit = (formData: Partial<Character>) => {
    if (!formData.name?.trim()) return;

    const characterData = {
      ...formData,
      name: formData.name,
      description: formData.description || '',
      notes: formData.notes || '',
      tags: formData.tags || [],
      relationships: formData.relationships || []
    } as Character;

    if (editingCharacter) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: {
          ...editingCharacter,
          ...characterData
        }
      });
    } else {
      dispatch({
        type: 'ADD_CHARACTER',
        payload: {
          id: Date.now().toString(),
          ...characterData
        }
      });
    }
    
    resetForm();
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsAddingCharacter(true);
  };

  const handleDelete = (characterId: string) => {
    dispatch({
      type: 'DELETE_CHARACTER',
      payload: characterId
    });
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  return (
    <div className="h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Characters</h2>
          <p className="text-muted-foreground">Manage your story's characters with AI assistance</p>
        </div>
        <Sheet open={isAddingCharacter} onOpenChange={setIsAddingCharacter}>
          <SheetTrigger asChild>
            <Button onClick={() => setIsAddingCharacter(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Character
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingCharacter ? 'Edit Character' : 'Add New Character'}
              </SheetTitle>
              <SheetDescription>
                {editingCharacter ? 'Update character details' : 'Create a new character for your story with AI assistance'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CharacterForm
                character={editingCharacter}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search and Filter */}
      {state.characters.length > 0 && (
        <div className="mb-6">
          <CharacterSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            availableTags={availableTags}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {state.characters.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No characters yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first character. Use AI assistance to generate detailed characters quickly!
          </p>
          <Button onClick={() => setIsAddingCharacter(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Character
          </Button>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No characters match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or clearing the filters.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Characters;
