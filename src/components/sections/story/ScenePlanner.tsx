
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Edit3, Trash2, Users, MapPin } from 'lucide-react';
import { useStoryStructure } from '@/hooks/story/useStoryStructure';
import { useWriting } from '@/contexts/WritingContext';
import type { Scene } from '@/hooks/story/types';

const ScenePlanner = () => {
  const { storyStructure, addScene, updateScene, deleteScene } = useStoryStructure();
  const { state } = useWriting();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    act: 1 as 1 | 2 | 3,
    position: 1,
    conflicts: [] as string[],
    tensionLevel: 5,
    paceType: 'medium' as 'slow' | 'medium' | 'fast',
    characters: [] as string[],
    location: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      act: 1,
      position: 1,
      conflicts: [],
      tensionLevel: 5,
      paceType: 'medium',
      characters: [],
      location: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingId) {
      updateScene(editingId, {
        ...formData,
        completed: false
      });
    } else {
      addScene({
        ...formData,
        completed: false
      });
    }
    resetForm();
  };

  const handleEdit = (scene: Scene) => {
    setFormData({
      title: scene.title,
      description: scene.description,
      act: scene.act,
      position: scene.position,
      conflicts: scene.conflicts,
      tensionLevel: scene.tensionLevel,
      paceType: scene.paceType,
      characters: scene.characters,
      location: scene.location || ''
    });
    setEditingId(scene.id);
  };

  const getPaceColor = (pace: string) => {
    switch (pace) {
      case 'slow': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'fast': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTensionColor = (tension: number) => {
    if (tension <= 3) return 'bg-green-100 text-green-800';
    if (tension <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Scene Planner
        </CardTitle>
        <CardDescription>
          Plan and organize your story scenes across the three-act structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Scene
        </Button>

        {(isAdding || editingId) && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <Input
              placeholder="Scene title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            <Textarea
              placeholder="Scene description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Act</label>
                <Select
                  value={formData.act.toString()}
                  onValueChange={(value) => setFormData({ ...formData, act: parseInt(value) as 1 | 2 | 3 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Act 1 - Setup</SelectItem>
                    <SelectItem value="2">Act 2 - Confrontation</SelectItem>
                    <SelectItem value="3">Act 3 - Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pace</label>
                <Select
                  value={formData.paceType}
                  onValueChange={(value) => setFormData({ ...formData, paceType: value as 'slow' | 'medium' | 'fast' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tension Level: {formData.tensionLevel}/10
              </label>
              <Slider
                value={[formData.tensionLevel]}
                onValueChange={(value) => setFormData({ ...formData, tensionLevel: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <Input
              placeholder="Location (optional)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingId ? 'Update Scene' : 'Add Scene'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Planned Scenes</h3>
          {storyStructure.scenes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No scenes planned yet. Add your first scene above.
            </p>
          ) : (
            <div className="space-y-3">
              {storyStructure.scenes
                .sort((a, b) => a.act - b.act || a.position - b.position)
                .map((scene) => (
                  <div key={scene.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Act {scene.act}</Badge>
                          <Badge className={getPaceColor(scene.paceType)}>
                            {scene.paceType} pace
                          </Badge>
                          <Badge className={getTensionColor(scene.tensionLevel)}>
                            Tension: {scene.tensionLevel}/10
                          </Badge>
                        </div>
                        <h4 className="font-medium">{scene.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {scene.description}
                        </p>
                        {(scene.characters.length > 0 || scene.location) && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {scene.characters.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {scene.characters.slice(0, 3).join(', ')}
                                {scene.characters.length > 3 && ' +more'}
                              </div>
                            )}
                            {scene.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {scene.location}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(scene)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScene(scene.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenePlanner;
