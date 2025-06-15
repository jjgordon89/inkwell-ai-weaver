
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWriting } from '@/contexts/WritingContext';
import type { StoryArc } from '@/contexts/WritingContext';

const StoryArcs = () => {
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

      {/* Add New Story Arc Form */}
      {isAdding && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-3">New Story Arc</h3>
          <div className="space-y-3">
            <Input
              placeholder="Arc title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
            <Textarea
              placeholder="Arc description and key plot points..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                Add Arc
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Story Arcs List */}
      <div className="flex-grow overflow-auto">
        {state.storyArcs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">No story arcs yet</p>
            <p>Create your first story arc to start planning your narrative structure.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.storyArcs.map((storyArc) => (
              <div
                key={storyArc.id}
                className={`p-4 border rounded-lg transition-colors ${
                  storyArc.completed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-card hover:bg-muted/50'
                }`}
              >
                {editingId === storyArc.id ? (
                  <div className="space-y-3">
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      autoFocus
                    />
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-grow">
                        <button
                          onClick={() => handleToggleComplete(storyArc)}
                          className="flex-shrink-0"
                        >
                          {storyArc.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                        <h3 className={`text-lg font-semibold ${
                          storyArc.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {storyArc.title}
                        </h3>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          onClick={() => handleEdit(storyArc)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {storyArc.description && (
                      <p className={`text-sm leading-relaxed ${
                        storyArc.completed ? 'text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {storyArc.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryArcs;
