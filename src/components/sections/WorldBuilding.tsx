
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useWorldBuilding } from '@/hooks/useWorldBuilding';
import WorldElementForm from './world-building/WorldElementForm';
import WorldElementsList from './world-building/WorldElementsList';

const WorldBuilding = () => {
  const {
    state,
    isAdding,
    setIsAdding,
    editingId,
    formData,
    setFormData,
    handleAdd,
    handleEdit,
    handleSaveEdit,
    handleDelete,
    handleCancel,
    groupedElements
  } = useWorldBuilding();

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">World Building</h2>
        <Button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="h-4 w-4" />
          Add Element
        </Button>
      </div>

      {/* Add New World Element Form */}
      {isAdding && (
        <WorldElementForm
          formData={formData}
          isEditing={false}
          onFormDataChange={setFormData}
          onSubmit={handleAdd}
          onCancel={handleCancel}
        />
      )}

      {/* World Elements List */}
      <div className="flex-grow overflow-auto">
        <WorldElementsList
          groupedElements={groupedElements}
          editingId={editingId}
          formData={formData}
          onFormDataChange={setFormData}
          onEdit={handleEdit}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default WorldBuilding;
