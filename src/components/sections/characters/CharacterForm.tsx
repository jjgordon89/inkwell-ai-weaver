
import React, { useState } from 'react';
import { Bot, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Character } from '@/contexts/WritingContext';
import { useCharacterAI } from '@/hooks/useCharacterAI';

interface CharacterFormProps {
  character?: Character | null;
  onSubmit: (data: Partial<Character>) => void;
  onCancel: () => void;
}

const CharacterForm = ({ character, onSubmit, onCancel }: CharacterFormProps) => {
  const { generateCharacter, isGenerating } = useCharacterAI();
  const [formData, setFormData] = useState({
    name: character?.name || '',
    description: character?.description || '',
    notes: character?.notes || '',
    age: character?.age || '',
    occupation: character?.occupation || '',
    appearance: character?.appearance || '',
    personality: character?.personality || '',
    backstory: character?.backstory || '',
    tags: character?.tags || []
  });
  const [newTag, setNewTag] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      age: formData.age ? Number(formData.age) : undefined,
      relationships: character?.relationships || []
    };
    
    onSubmit(submitData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      const generatedData = await generateCharacter(aiPrompt);
      setFormData(prev => ({
        ...prev,
        ...generatedData,
        tags: [...prev.tags, ...(generatedData.tags || [])].filter((tag, index, arr) => arr.indexOf(tag) === index)
      }));
      setAiPrompt('');
    } catch (error) {
      console.error('Failed to generate character:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Generation Section */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          AI Character Generation
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="Describe your character (e.g., 'mysterious detective from Victorian era')"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAIGenerate}
            disabled={!aiPrompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name *
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
          <label htmlFor="age" className="block text-sm font-medium mb-2">
            Age
          </label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Age"
          />
        </div>
      </div>

      <div>
        <label htmlFor="occupation" className="block text-sm font-medium mb-2">
          Occupation
        </label>
        <Input
          id="occupation"
          value={formData.occupation}
          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
          placeholder="What does this character do?"
        />
      </div>

      <div>
        <label htmlFor="appearance" className="block text-sm font-medium mb-2">
          Appearance
        </label>
        <Textarea
          id="appearance"
          value={formData.appearance}
          onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
          placeholder="Physical description, clothing style, distinguishing features..."
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="personality" className="block text-sm font-medium mb-2">
          Personality
        </label>
        <Textarea
          id="personality"
          value={formData.personality}
          onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
          placeholder="Personality traits, quirks, behavioral patterns..."
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          General Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Overall character description..."
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="backstory" className="block text-sm font-medium mb-2">
          Backstory
        </label>
        <Textarea
          id="backstory"
          value={formData.backstory}
          onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
          placeholder="Character's history, important events, motivations..."
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
          placeholder="Additional notes, plot relevance, development ideas..."
          rows={3}
        />
      </div>

      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {character ? 'Update Character' : 'Add Character'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CharacterForm;
