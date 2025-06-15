
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWriting } from '@/contexts/WritingContext';
import { Character } from '@/contexts/WritingContext';

const Characters = () => {
  const { state, dispatch } = useWriting();
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', notes: '' });
    setEditingCharacter(null);
    setIsAddingCharacter(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (editingCharacter) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: {
          ...editingCharacter,
          ...formData
        }
      });
    } else {
      dispatch({
        type: 'ADD_CHARACTER',
        payload: {
          id: Date.now().toString(),
          ...formData
        }
      });
    }
    
    resetForm();
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description: character.description,
      notes: character.notes
    });
    setIsAddingCharacter(true);
  };

  const handleDelete = (characterId: string) => {
    dispatch({
      type: 'DELETE_CHARACTER',
      payload: characterId
    });
  };

  return (
    <div className="h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Characters</h2>
          <p className="text-muted-foreground">Manage your story's characters</p>
        </div>
        <Sheet open={isAddingCharacter} onOpenChange={setIsAddingCharacter}>
          <SheetTrigger asChild>
            <Button onClick={() => setIsAddingCharacter(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Character
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingCharacter ? 'Edit Character' : 'Add New Character'}
              </SheetTitle>
              <SheetDescription>
                {editingCharacter ? 'Update character details' : 'Create a new character for your story'}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Character name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Physical appearance, personality, background..."
                  rows={4}
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes, character development, plot relevance..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCharacter ? 'Update Character' : 'Add Character'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {state.characters.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No characters yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first character to keep track of their details and development
          </p>
          <Button onClick={() => setIsAddingCharacter(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Character
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.characters.map((character) => (
            <Card key={character.id} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{character.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(character)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(character.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {character.description && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {character.description}
                    </p>
                  </div>
                )}
                {character.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {character.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Characters;
