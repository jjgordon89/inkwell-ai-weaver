
import { useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import type { StoryArc } from '@/contexts/WritingContext';

export const useStoryArcs = () => {
  const { state, dispatch } = useWriting();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleAdd = () => {
    if (formData.title.trim()) {
      const newStoryArc: StoryArc = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        completed: false
      };
      dispatch({ type: 'ADD_STORY_ARC', payload: newStoryArc });
      setFormData({ title: '', description: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (storyArc: StoryArc) => {
    setEditingId(storyArc.id);
    setFormData({
      title: storyArc.title,
      description: storyArc.description
    });
  };

  const handleSaveEdit = () => {
    if (editingId && formData.title.trim()) {
      const storyArcToUpdate = state.storyArcs.find(arc => arc.id === editingId);
      if (storyArcToUpdate) {
        const updatedStoryArc: StoryArc = {
          ...storyArcToUpdate,
          title: formData.title,
          description: formData.description
        };
        dispatch({ type: 'UPDATE_STORY_ARC', payload: updatedStoryArc });
      }
      setFormData({ title: '', description: '' });
      setEditingId(null);
    }
  };

  const handleToggleComplete = (storyArc: StoryArc) => {
    const updatedStoryArc: StoryArc = {
      ...storyArc,
      completed: !storyArc.completed
    };
    dispatch({ type: 'UPDATE_STORY_ARC', payload: updatedStoryArc });
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return {
    storyArcs: state.storyArcs,
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
  };
};
