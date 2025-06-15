
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, MapPin, Building, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWriting } from '@/contexts/WritingContext';
import type { WorldElement } from '@/contexts/WritingContext';

const WorldBuilding = () => {
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

  const getIcon = (type: WorldElement['type']) => {
    switch (type) {
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'organization':
        return <Building className="h-4 w-4" />;
      case 'concept':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: WorldElement['type']) => {
    switch (type) {
      case 'location':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
      case 'organization':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
      case 'concept':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    }
  };

  const groupedElements = {
    location: state.worldElements.filter(el => el.type === 'location'),
    organization: state.worldElements.filter(el => el.type === 'organization'),
    concept: state.worldElements.filter(el => el.type === 'concept')
  };

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
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-3">New World Element</h3>
          <div className="space-y-3">
            <Input
              placeholder="Element name..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
            <Select
              value={formData.type}
              onValueChange={(value: WorldElement['type']) => 
                setFormData({ ...formData, type: value })
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                Add Element
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* World Elements List */}
      <div className="flex-grow overflow-auto">
        {state.worldElements.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">No world elements yet</p>
            <p>Start building your world by adding locations, organizations, and concepts.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedElements).map(([type, elements]) => (
              elements.length > 0 && (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
                    {getIcon(type as WorldElement['type'])}
                    {type}s ({elements.length})
                  </h3>
                  <div className="grid gap-3">
                    {elements.map((element) => (
                      <Card key={element.id} className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-2">
                          {editingId === element.id ? (
                            <div className="space-y-3">
                              <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                              />
                              <Select
                                value={formData.type}
                                onValueChange={(value: WorldElement['type']) => 
                                  setFormData({ ...formData, type: value })
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
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{element.name}</CardTitle>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(element.type)}`}>
                                    {element.type}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => handleEdit(element)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(element.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </CardHeader>
                        {editingId !== element.id && element.description && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {element.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldBuilding;
