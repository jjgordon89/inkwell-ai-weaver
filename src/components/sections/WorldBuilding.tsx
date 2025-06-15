
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWriting } from '@/contexts/WritingContext';
import { useWorldBuilding } from '@/hooks/useWorldBuilding';
import WorldElementForm from './world-building/WorldElementForm';
import WorldElementsList from './world-building/WorldElementsList';
import AIWorldBuildingGenerator from './world-building/AIWorldBuildingGenerator';
import WorldMaps from './world-building/WorldMaps';
import TimelineManager from './world-building/TimelineManager';
import WorldRules from './world-building/WorldRules';
import ResearchReferences from './world-building/ResearchReferences';
import type { WorldElement } from '@/contexts/WritingContext';

const WorldBuilding = () => {
  const { dispatch } = useWriting();
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

  const handleAIWorldElementGenerated = (generatedElement: Partial<WorldElement>) => {
    const newWorldElement: WorldElement = {
      id: crypto.randomUUID(),
      name: generatedElement.name || 'Untitled Element',
      type: generatedElement.type || 'location',
      description: generatedElement.description || ''
    };
    dispatch({ type: 'ADD_WORLD_ELEMENT', payload: newWorldElement });
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">World Building</h2>
      </div>

      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="maps">Maps</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="flex-1 overflow-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">World Elements</h3>
            <Button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2"
              disabled={isAdding || editingId !== null}
            >
              <Plus className="h-4 w-4" />
              Add Element
            </Button>
          </div>

          {/* AI World Building Generator */}
          <AIWorldBuildingGenerator
            onWorldElementGenerated={handleAIWorldElementGenerated}
            currentElements={state.worldElements}
          />

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
        </TabsContent>

        <TabsContent value="maps" className="flex-1 overflow-auto">
          <WorldMaps />
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 overflow-auto">
          <TimelineManager />
        </TabsContent>

        <TabsContent value="rules" className="flex-1 overflow-auto">
          <WorldRules />
        </TabsContent>

        <TabsContent value="research" className="flex-1 overflow-auto">
          <ResearchReferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorldBuilding;
