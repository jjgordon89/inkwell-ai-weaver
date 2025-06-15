
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Zap, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { useStoryStructure } from '@/hooks/story/useStoryStructure';
import type { ConflictType } from '@/hooks/story/types';

const ConflictTracker = () => {
  const { storyStructure, addConflict, updateConflict, deleteConflict } = useStoryStructure();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'internal' as 'internal' | 'interpersonal' | 'societal' | 'environmental',
    name: '',
    description: '',
    intensity: 5,
    resolution: ''
  });

  const resetForm = () => {
    setFormData({
      type: 'internal',
      name: '',
      description: '',
      intensity: 5,
      resolution: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      updateConflict(editingId, formData);
    } else {
      addConflict(formData);
    }
    resetForm();
  };

  const handleEdit = (conflict: ConflictType) => {
    setFormData({
      type: conflict.type,
      name: conflict.name,
      description: conflict.description,
      intensity: conflict.intensity,
      resolution: conflict.resolution || ''
    });
    setEditingId(conflict.id);
  };

  const getConflictTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-purple-100 text-purple-800';
      case 'interpersonal': return 'bg-blue-100 text-blue-800';
      case 'societal': return 'bg-green-100 text-green-800';
      case 'environmental': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-100 text-green-800';
    if (intensity <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConflictTypeDescription = (type: string) => {
    switch (type) {
      case 'internal': return 'Character vs. self';
      case 'interpersonal': return 'Character vs. character';
      case 'societal': return 'Character vs. society';
      case 'environmental': return 'Character vs. nature/environment';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Conflict & Tension Tracker
        </CardTitle>
        <CardDescription>
          Track different types of conflicts and monitor tension levels throughout your story
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Conflict
        </Button>

        {(isAdding || editingId) && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conflict Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ConflictType['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">
                    <div>
                      <div className="font-medium">Internal</div>
                      <div className="text-xs text-muted-foreground">Character vs. self</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="interpersonal">
                    <div>
                      <div className="font-medium">Interpersonal</div>
                      <div className="text-xs text-muted-foreground">Character vs. character</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="societal">
                    <div>
                      <div className="font-medium">Societal</div>
                      <div className="text-xs text-muted-foreground">Character vs. society</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="environmental">
                    <div>
                      <div className="font-medium">Environmental</div>
                      <div className="text-xs text-muted-foreground">Character vs. nature</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Conflict name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <Textarea
              placeholder="Describe the conflict..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Intensity Level: {formData.intensity}/10
              </label>
              <Slider
                value={[formData.intensity]}
                onValueChange={(value) => setFormData({ ...formData, intensity: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <Textarea
              placeholder="Resolution plan (optional)..."
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              rows={2}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingId ? 'Update Conflict' : 'Add Conflict'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Active Conflicts</h3>
          {storyStructure.conflicts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No conflicts tracked yet. Add your first conflict above.
            </p>
          ) : (
            <div className="space-y-3">
              {storyStructure.conflicts.map((conflict) => (
                <div key={conflict.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getConflictTypeColor(conflict.type)}>
                          {conflict.type}
                        </Badge>
                        <Badge className={getIntensityColor(conflict.intensity)}>
                          Intensity: {conflict.intensity}/10
                        </Badge>
                        {conflict.resolution && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Planned
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{conflict.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {conflict.description}
                      </p>
                      {conflict.resolution && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <strong>Resolution plan:</strong> {conflict.resolution}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(conflict)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteConflict(conflict.id)}
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

        {storyStructure.conflicts.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Conflict Distribution</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {['internal', 'interpersonal', 'societal', 'environmental'].map(type => {
                const count = storyStructure.conflicts.filter(c => c.type === type).length;
                const percentage = storyStructure.conflicts.length > 0 
                  ? (count / storyStructure.conflicts.length * 100).toFixed(0)
                  : '0';
                
                return (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}:</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictTracker;
