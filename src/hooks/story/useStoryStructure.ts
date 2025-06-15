
import { useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import type { Scene, Act, ConflictType, StoryStructure } from './types';

export const useStoryStructure = () => {
  const { state } = useWriting();
  const [storyStructure, setStoryStructure] = useState<StoryStructure>({
    acts: [
      {
        number: 1,
        title: 'Setup',
        description: 'Introduce characters, world, and initial conflict',
        scenes: [],
        targetWordCount: 25000,
        actualWordCount: 0
      },
      {
        number: 2,
        title: 'Confrontation',
        description: 'Rising action, complications, and character development',
        scenes: [],
        targetWordCount: 50000,
        actualWordCount: 0
      },
      {
        number: 3,
        title: 'Resolution',
        description: 'Climax, falling action, and conclusion',
        scenes: [],
        targetWordCount: 25000,
        actualWordCount: 0
      }
    ],
    scenes: [],
    conflicts: []
  });

  const addScene = (scene: Omit<Scene, 'id'>) => {
    const newScene: Scene = {
      ...scene,
      id: crypto.randomUUID()
    };

    setStoryStructure(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
      acts: prev.acts.map(act => 
        act.number === scene.act 
          ? { ...act, scenes: [...act.scenes, newScene] }
          : act
      )
    }));
  };

  const updateScene = (sceneId: string, updates: Partial<Scene>) => {
    setStoryStructure(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ),
      acts: prev.acts.map(act => ({
        ...act,
        scenes: act.scenes.map(scene =>
          scene.id === sceneId ? { ...scene, ...updates } : scene
        )
      }))
    }));
  };

  const deleteScene = (sceneId: string) => {
    setStoryStructure(prev => ({
      ...prev,
      scenes: prev.scenes.filter(scene => scene.id !== sceneId),
      acts: prev.acts.map(act => ({
        ...act,
        scenes: act.scenes.filter(scene => scene.id !== sceneId)
      }))
    }));
  };

  const addConflict = (conflict: Omit<ConflictType, 'id'>) => {
    const newConflict: ConflictType = {
      ...conflict,
      id: crypto.randomUUID()
    };

    setStoryStructure(prev => ({
      ...prev,
      conflicts: [...prev.conflicts, newConflict]
    }));
  };

  const updateConflict = (conflictId: string, updates: Partial<ConflictType>) => {
    setStoryStructure(prev => ({
      ...prev,
      conflicts: prev.conflicts.map(conflict =>
        conflict.id === conflictId ? { ...conflict, ...updates } : conflict
      )
    }));
  };

  const deleteConflict = (conflictId: string) => {
    setStoryStructure(prev => ({
      ...prev,
      conflicts: prev.conflicts.filter(conflict => conflict.id !== conflictId)
    }));
  };

  const calculateActProgress = (actNumber: 1 | 2 | 3) => {
    const act = storyStructure.acts.find(a => a.number === actNumber);
    if (!act || !act.targetWordCount) return 0;
    
    return Math.min((act.actualWordCount / act.targetWordCount) * 100, 100);
  };

  const getTensionCurve = () => {
    return storyStructure.scenes
      .sort((a, b) => a.act - b.act || a.position - b.position)
      .map(scene => scene.tensionLevel);
  };

  return {
    storyStructure,
    addScene,
    updateScene,
    deleteScene,
    addConflict,
    updateConflict,
    deleteConflict,
    calculateActProgress,
    getTensionCurve
  };
};
