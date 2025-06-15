
import { useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import type { WorldElement } from '@/contexts/WritingContext';

export const useWorldBuilding = () => {
  const { state, dispatch } = useWriting();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'location' as WorldElement['type'],
    description: ''
  });

  const handleAdd = () => {
    if (formData.name.trim()) {
      const newWorldElement: WorldElement = {
        id: crypto.randomUUID(),
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      dispatch({ type: 'ADD_WORLD_ELEMENT', payload: newWorldElement });
      setFormData({ name: '', type: 'location', description: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (element: WorldElement) => {
    setEditingId(element.id);
    setFormData({
      name: element.name,
      type: element.type,
      description: element.description
    });
  };

  const handleSaveEdit = () => {
    if (editingId && formData.name.trim()) {
      const elementToUpdate = state.worldElements.find(el => el.id === editingId);
      if (elementToUpdate) {
        const updatedElement: WorldElement = {
          ...elementToUpdate,
          name: formData.name,
          type: formData.type,
          description: formData.description
        };
        dispatch({ type: 'UPDATE_WORLD_ELEMENT', payload: updatedElement });
      }
      setFormData({ name: '', type: 'location', description: '' });
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_WORLD_ELEMENT', payload: id });
  };

  const handleCancel = () => {
    setFormData({ name: '', type: 'location', description: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const groupedElements = {
    location: state.worldElements.filter(el => el.type === 'location'),
    organization: state.worldElements.filter(el => el.type === 'organization'),
    concept: state.worldElements.filter(el => el.type === 'concept')
  };

  return {
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
  };
};
