
import { useState } from 'react';
import type { ResearchReference } from './types';

export const useResearchReferences = () => {
  const [references, setReferences] = useState<ResearchReference[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const addReference = (refData: Omit<ResearchReference, 'id' | 'dateAdded'>) => {
    const newReference: ResearchReference = {
      ...refData,
      id: crypto.randomUUID(),
      dateAdded: new Date()
    };
    setReferences(prev => [...prev, newReference]);
    return newReference;
  };

  const updateReference = (refId: string, updates: Partial<ResearchReference>) => {
    setReferences(prev => prev.map(ref => 
      ref.id === refId ? { ...ref, ...updates } : ref
    ));
  };

  const deleteReference = (refId: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== refId));
  };

  const getReferencesByType = (type: ResearchReference['type']) => {
    return references.filter(ref => ref.type === type);
  };

  const getReferencesByTags = (tags: string[]) => {
    return references.filter(ref => 
      tags.some(tag => ref.tags.includes(tag))
    );
  };

  const searchReferences = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return references.filter(ref => 
      ref.title.toLowerCase().includes(lowercaseQuery) ||
      ref.description.toLowerCase().includes(lowercaseQuery) ||
      ref.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getAllTags = () => {
    const allTags = references.flatMap(ref => ref.tags);
    return [...new Set(allTags)].sort();
  };

  const filteredReferences = selectedTags.length > 0 
    ? getReferencesByTags(selectedTags)
    : references;

  return {
    references: filteredReferences,
    allReferences: references,
    selectedTags,
    setSelectedTags,
    addReference,
    updateReference,
    deleteReference,
    getReferencesByType,
    getReferencesByTags,
    searchReferences,
    getAllTags
  };
};
