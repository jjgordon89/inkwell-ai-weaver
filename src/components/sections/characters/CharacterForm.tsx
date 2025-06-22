
import React, { useState } from 'react';
import { Bot, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Character } from '@/contexts/WritingContext';
import { useCharacterAI } from '@/hooks/useCharacterAI';
import { useFormValidation } from '@/hooks/useFormValidation';
import { validationRules } from '@/utils/validation';

interface CharacterFormProps {
  character?: Character | null;
  onSubmit: (data: Omit<Character, 'id'>) => void;
  onCancel: () => void;
}

const CharacterForm = ({ character, onSubmit, onCancel }: CharacterFormProps) => {
  const { generateCharacter, isGenerating } = useCharacterAI();
  const [newTag, setNewTag] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [tags, setTags] = useState<string[]>(character?.tags || []);

  const {
    fields,
    errors,
    setField,
    setFieldTouched,
    validateAll,
    getFieldError,
    isFieldInvalid
  } = useFormValidation({
    name: {
      value: character?.name || '',
      rules: [
        validationRules.required('Character name is required'),
        validationRules.minLength(2, 'Name must be at least 2 characters'),
        validationRules.maxLength(100, 'Name must be no more than 100 characters')
      ]
    },
    description: {
      value: character?.description || '',
      rules: [
        validationRules.required('Character description is required'),
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(2000, 'Description must be no more than 2000 characters')
      ]
    },
    notes: {
      value: character?.notes || '',
      rules: [
        validationRules.maxLength(2000, 'Notes must be no more than 2000 characters')
      ]
    },
    age: {
      value: character?.age?.toString() || '',
      rules: [
        validationRules.range(0, 200, 'Age must be between 0 and 200')
      ]
    },
    occupation: {
      value: character?.occupation || '',
      rules: [
        validationRules.maxLength(100, 'Occupation must be no more than 100 characters')
      ]
    },
    appearance: {
      value: character?.appearance || '',
      rules: [
        validationRules.maxLength(1000, 'Appearance description must be no more than 1000 characters')
      ]
    },
    personality: {
      value: character?.personality || '',
      rules: [
        validationRules.maxLength(1000, 'Personality description must be no more than 1000 characters')
      ]
    },
    backstory: {
      value: character?.backstory || '',
      rules: [
        validationRules.maxLength(2000, 'Backstory must be no more than 2000 characters')
      ]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    const submitData: Omit<Character, 'id'> = {
      name: String(fields.name.value),
      description: String(fields.description.value),
      notes: String(fields.notes.value),
      age: fields.age.value ? Number(fields.age.value) : undefined,
      occupation: fields.occupation.value ? String(fields.occupation.value) : undefined,
      appearance: fields.appearance.value ? String(fields.appearance.value) : undefined,
      personality: fields.personality.value ? String(fields.personality.value) : undefined,
      backstory: fields.backstory.value ? String(fields.backstory.value) : undefined,
      tags,
      relationships: character?.relationships || [],
      createdWith: character?.createdWith || 'manual',
      voiceNotes: character?.voiceNotes,
      arcProgress: character?.arcProgress
    };
    
    onSubmit(submitData);
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && trimmed.length <= 50 && !tags.includes(trimmed) && tags.length < 10) {
      setTags(prev => [...prev, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || aiPrompt.trim().length < 3) return;
    
    try {
      const generatedData = await generateCharacter(aiPrompt);
      
      // Update form fields with generated data
      if (generatedData.name) setField('name', generatedData.name);
      if (generatedData.description) setField('description', generatedData.description);
      if (generatedData.age) setField('age', generatedData.age.toString());
      if (generatedData.occupation) setField('occupation', generatedData.occupation);
      if (generatedData.appearance) setField('appearance', generatedData.appearance);
      if (generatedData.personality) setField('personality', generatedData.personality);
      if (generatedData.backstory) setField('backstory', generatedData.backstory);
      
      if (generatedData.tags) {
        setTags(prev => [...prev, ...generatedData.tags!].filter((tag, index, arr) => arr.indexOf(tag) === index).slice(0, 10));
      }
      
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
            maxLength={500}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAIGenerate}
            disabled={!aiPrompt.trim() || aiPrompt.trim().length < 3 || isGenerating}
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
            value={String(fields.name.value)}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => setFieldTouched('name')}
            placeholder="Character name"
            className={isFieldInvalid('name') ? "border-red-500" : ""}
            required
          />
          {getFieldError('name') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('name')}</p>
          )}
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium mb-2">
            Age
          </label>
          <Input
            id="age"
            type="number"
            min="0"
            max="200"
            value={String(fields.age.value)}
            onChange={(e) => setField('age', e.target.value)}
            onBlur={() => setFieldTouched('age')}
            placeholder="Age"
            className={isFieldInvalid('age') ? "border-red-500" : ""}
          />
          {getFieldError('age') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('age')}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="occupation" className="block text-sm font-medium mb-2">
          Occupation
        </label>
        <Input
          id="occupation"
          value={String(fields.occupation.value)}
          onChange={(e) => setField('occupation', e.target.value)}
          onBlur={() => setFieldTouched('occupation')}
          placeholder="What does this character do?"
          className={isFieldInvalid('occupation') ? "border-red-500" : ""}
          maxLength={100}
        />
        {getFieldError('occupation') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('occupation')}</p>
        )}
      </div>

      <div>
        <label htmlFor="appearance" className="block text-sm font-medium mb-2">
          Appearance
        </label>
        <Textarea
          id="appearance"
          value={String(fields.appearance.value)}
          onChange={(e) => setField('appearance', e.target.value)}
          onBlur={() => setFieldTouched('appearance')}
          placeholder="Physical description, clothing style, distinguishing features..."
          rows={3}
          className={isFieldInvalid('appearance') ? "border-red-500" : ""}
          maxLength={1000}
        />
        {getFieldError('appearance') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('appearance')}</p>
        )}
      </div>

      <div>
        <label htmlFor="personality" className="block text-sm font-medium mb-2">
          Personality
        </label>
        <Textarea
          id="personality"
          value={String(fields.personality.value)}
          onChange={(e) => setField('personality', e.target.value)}
          onBlur={() => setFieldTouched('personality')}
          placeholder="Personality traits, quirks, behavioral patterns..."
          rows={3}
          className={isFieldInvalid('personality') ? "border-red-500" : ""}
          maxLength={1000}
        />
        {getFieldError('personality') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('personality')}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          General Description *
        </label>
        <Textarea
          id="description"
          value={String(fields.description.value)}
          onChange={(e) => setField('description', e.target.value)}
          onBlur={() => setFieldTouched('description')}
          placeholder="Overall character description..."
          rows={4}
          className={isFieldInvalid('description') ? "border-red-500" : ""}
          maxLength={2000}
          required
        />
        {getFieldError('description') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('description')}</p>
        )}
      </div>

      <div>
        <label htmlFor="backstory" className="block text-sm font-medium mb-2">
          Backstory
        </label>
        <Textarea
          id="backstory"
          value={String(fields.backstory.value)}
          onChange={(e) => setField('backstory', e.target.value)}
          onBlur={() => setFieldTouched('backstory')}
          placeholder="Character's history, important events, motivations..."
          rows={4}
          className={isFieldInvalid('backstory') ? "border-red-500" : ""}
          maxLength={2000}
        />
        {getFieldError('backstory') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('backstory')}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          Notes
        </label>
        <Textarea
          id="notes"
          value={String(fields.notes.value)}
          onChange={(e) => setField('notes', e.target.value)}
          onBlur={() => setFieldTouched('notes')}
          placeholder="Additional notes, plot relevance, development ideas..."
          rows={3}
          className={isFieldInvalid('notes') ? "border-red-500" : ""}
          maxLength={2000}
        />
        {getFieldError('notes') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('notes')}</p>
        )}
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
            maxLength={50}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddTag}
            disabled={!newTag.trim() || tags.length >= 10 || tags.includes(newTag.trim())}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
        {tags.length >= 10 && (
          <p className="text-xs text-amber-600 mt-1">Maximum 10 tags allowed</p>
        )}
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
