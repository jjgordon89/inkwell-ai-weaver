
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StoryArcFormProps {
  title: string;
  description: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const StoryArcForm = ({
  title,
  description,
  isEditing,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel
}: StoryArcFormProps) => {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold mb-3">
        {isEditing ? 'Edit Story Arc' : 'New Story Arc'}
      </h3>
      <div className="space-y-3">
        <Input
          placeholder="Arc title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          autoFocus
        />
        <Textarea
          placeholder="Arc description and key plot points..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
        <div className="flex gap-2">
          <Button onClick={onSubmit} size="sm">
            {isEditing ? 'Save' : 'Add Arc'}
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryArcForm;
