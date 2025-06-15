
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormValidation } from '@/hooks/useFormValidation';
import { validationRules } from '@/utils/validation';

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
  const {
    setField,
    setFieldTouched,
    validateAll,
    getFieldError,
    isFieldInvalid
  } = useFormValidation({
    title: {
      value: title,
      rules: [
        validationRules.required('Story arc title is required'),
        validationRules.minLength(3, 'Title must be at least 3 characters'),
        validationRules.maxLength(200, 'Title must be no more than 200 characters')
      ]
    },
    description: {
      value: description,
      rules: [
        validationRules.required('Story arc description is required'),
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(3000, 'Description must be no more than 3000 characters')
      ]
    }
  });

  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
    setField('title', newTitle);
  };

  const handleDescriptionChange = (newDescription: string) => {
    onDescriptionChange(newDescription);
    setField('description', newDescription);
  };

  const handleSubmit = () => {
    if (validateAll()) {
      onSubmit();
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold mb-3">
        {isEditing ? 'Edit Story Arc' : 'New Story Arc'}
      </h3>
      <div className="space-y-3">
        <div>
          <Input
            placeholder="Arc title..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => setFieldTouched('title')}
            className={isFieldInvalid('title') ? "border-red-500" : ""}
            maxLength={200}
            autoFocus
          />
          {getFieldError('title') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('title')}</p>
          )}
        </div>
        <div>
          <Textarea
            placeholder="Arc description and key plot points..."
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            onBlur={() => setFieldTouched('description')}
            className={isFieldInvalid('description') ? "border-red-500" : ""}
            rows={3}
            maxLength={3000}
          />
          {getFieldError('description') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('description')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} size="sm">
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
