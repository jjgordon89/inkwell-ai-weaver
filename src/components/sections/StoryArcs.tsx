
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useStoryArcs } from '@/hooks/useStoryArcs';
import { useWriting } from '@/contexts/WritingContext';
import StoryArcForm from './story-arcs/StoryArcForm';
import StoryArcsList from './story-arcs/StoryArcsList';
import AIStoryArcGenerator from './story-arcs/AIStoryArcGenerator';
import type { StoryArc } from '@/contexts/WritingContext';

const StoryArcs = () => {
  const { dispatch } = useWriting();
  const {
    storyArcs,
    isAdding,
    setIsAdding,
    editingId,
    formData,
    setFormData,
    handleAdd,
    handleEdit,
    handleSaveEdit,
    handleToggleComplete,
    handleCancel
  } = useStoryArcs();

  const handleAIStoryArcGenerated = (generatedArc: Partial<StoryArc>) => {
    const newStoryArc: StoryArc = {
      id: crypto.randomUUID(),
      title: generatedArc.title || 'Untitled Arc',
      description: generatedArc.description || '',
      completed: false
    };
    dispatch({ type: 'ADD_STORY_ARC', payload: newStoryArc });
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Story Arcs</h2>
        <Button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="h-4 w-4" />
          Add Arc
        </Button>
      </div>

      {/* AI Story Arc Generator */}
      <div className="mb-6">
        <AIStoryArcGenerator
          onStoryArcGenerated={handleAIStoryArcGenerated}
          currentArcs={storyArcs}
        />
      </div>

      {/* Add New Story Arc Form */}
      {isAdding && (
        <StoryArcForm
          title={formData.title}
          description={formData.description}
          isEditing={false}
          onTitleChange={(title) => setFormData({ ...formData, title })}
          onDescriptionChange={(description) => setFormData({ ...formData, description })}
          onSubmit={handleAdd}
          onCancel={handleCancel}
        />
      )}

      {/* Story Arcs List */}
      <div className="flex-grow overflow-auto">
        <StoryArcsList
          storyArcs={storyArcs}
          editingId={editingId}
          formData={formData}
          onFormDataChange={setFormData}
          onEdit={handleEdit}
          onSaveEdit={handleSaveEdit}
          onCancel={handleCancel}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </div>
  );
};

export default StoryArcs;
