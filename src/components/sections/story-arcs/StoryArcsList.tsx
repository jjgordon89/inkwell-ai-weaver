
import React from 'react';
import StoryArcItem from './StoryArcItem';
import StoryArcForm from './StoryArcForm';
import type { StoryArc } from '@/contexts/WritingContext';

interface StoryArcsListProps {
  storyArcs: StoryArc[];
  editingId: string | null;
  formData: { title: string; description: string };
  onFormDataChange: (data: { title: string; description: string }) => void;
  onEdit: (storyArc: StoryArc) => void;
  onSaveEdit: () => void;
  onCancel: () => void;
  onToggleComplete: (storyArc: StoryArc) => void;
}

const StoryArcsList = ({
  storyArcs,
  editingId,
  formData,
  onFormDataChange,
  onEdit,
  onSaveEdit,
  onCancel,
  onToggleComplete
}: StoryArcsListProps) => {
  if (storyArcs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg mb-2">No story arcs yet</p>
        <p>Create your first story arc to start planning your narrative structure.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {storyArcs.map((storyArc) => (
        <div key={storyArc.id}>
          {editingId === storyArc.id ? (
            <StoryArcForm
              title={formData.title}
              description={formData.description}
              isEditing={true}
              onTitleChange={(title) => onFormDataChange({ ...formData, title })}
              onDescriptionChange={(description) => onFormDataChange({ ...formData, description })}
              onSubmit={onSaveEdit}
              onCancel={onCancel}
            />
          ) : (
            <StoryArcItem
              storyArc={storyArc}
              onEdit={onEdit}
              onToggleComplete={onToggleComplete}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StoryArcsList;
