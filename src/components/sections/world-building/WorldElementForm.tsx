
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const WorldElementForm = ({
  formData,
  isEditing,
  onFormDataChange,
  onSubmit,
  onCancel
}: WorldElementFormProps) => {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold mb-3">
        {isEditing ? 'Edit World Element' : 'New World Element'}
      </h3>
      <div className="space-y-3">
        <Input
          placeholder="Element name..."
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          autoFocus
        />
        <Select
          value={formData.type}
          onValueChange={(value: WorldElement['type']) => 
            onFormDataChange({ ...formData, type: value })
          }
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
        <Textarea
          placeholder="Description and details..."
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          rows={3}
        />
        <div className="flex gap-2">
          <Button onClick={onSubmit} size="sm">
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
