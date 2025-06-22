
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormValidation } from '@/hooks/useFormValidation';
import { validationRules } from '@/utils/validation';
import type { WorldElement } from '@/contexts/WritingContext';

interface WorldElementFormProps {
  formData: {
    name: string;
    type: WorldElement['type'];
    description: string;
  };
  isEditing: boolean;
  onFormDataChange: (data: { name: string; type: WorldElement['type']; description: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const WorldElementForm: React.FC<WorldElementFormProps> = ({
  formData,
  isEditing,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  const {
    setField,
    setFieldTouched,
    validateAll,
    getFieldError,
    isFieldInvalid
  } = useFormValidation({
    name: {
      value: formData.name,
      rules: [
        validationRules.required('Element name is required'),
        validationRules.minLength(2, 'Name must be at least 2 characters'),
        validationRules.maxLength(100, 'Name must be no more than 100 characters')
      ]
    },
    description: {
      value: formData.description,
      rules: [
        validationRules.required('Element description is required'),
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(2000, 'Description must be no more than 2000 characters')
      ]
    }
  });

  const handleNameChange = (name: string) => {
    onFormDataChange({ ...formData, name });
    setField('name', name);
  };

  const handleDescriptionChange = (description: string) => {
    onFormDataChange({ ...formData, description });
    setField('description', description);
  };

  const handleTypeChange = (type: WorldElement['type']) => {
    onFormDataChange({ ...formData, type });
  };

  const handleSubmit = () => {
    if (validateAll()) {
      onSubmit();
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold mb-3">
        {isEditing ? 'Edit World Element' : 'New World Element'}
      </h3>
      <div className="space-y-3">
        <div>
          <Input
            placeholder="Element name..."
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setFieldTouched('name')}
            className={isFieldInvalid('name') ? "border-red-500" : ""}
            maxLength={100}
            autoFocus
          />
          {getFieldError('name') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('name')}</p>
          )}
        </div>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="location">Location</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
            <SelectItem value="concept">Concept</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <Textarea
            placeholder="Description and details..."
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            onBlur={() => setFieldTouched('description')}
            className={isFieldInvalid('description') ? "border-red-500" : ""}
            rows={3}
            maxLength={2000}
          />
          {getFieldError('description') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('description')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} size="sm">
            {isEditing ? 'Save' : 'Add Element'}
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorldElementForm;
