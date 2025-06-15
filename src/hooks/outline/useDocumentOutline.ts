
import { useState, useEffect } from 'react';
import type { OutlineItem, OutlineStructure, ViewMode, StatusFilter } from './types';

export const useDocumentOutline = () => {
  const [outlineStructure, setOutlineStructure] = useState<OutlineStructure>({
    items: [],
    totalWordCount: 0,
    completedItems: 0,
    totalItems: 0
  });

  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const addItem = (item: Omit<OutlineItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: OutlineItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setOutlineStructure(prev => {
      const newItems = [...prev.items, newItem];
      return {
        ...prev,
        items: newItems,
        totalItems: newItems.length,
        completedItems: newItems.filter(i => i.status === 'completed').length
      };
    });
  };

  const updateItem = (itemId: string, updates: Partial<OutlineItem>) => {
    setOutlineStructure(prev => {
      const newItems = prev.items.map(item =>
        item.id === itemId 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      );
      
      return {
        ...prev,
        items: newItems,
        completedItems: newItems.filter(i => i.status === 'completed').length,
        totalWordCount: newItems.reduce((sum, item) => sum + (item.wordCount || 0), 0)
      };
    });
  };

  const deleteItem = (itemId: string) => {
    setOutlineStructure(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      return {
        ...prev,
        items: newItems,
        totalItems: newItems.length,
        completedItems: newItems.filter(i => i.status === 'completed').length,
        totalWordCount: newItems.reduce((sum, item) => sum + (item.wordCount || 0), 0)
      };
    });
  };

  const moveItem = (itemId: string, newPosition: number) => {
    setOutlineStructure(prev => {
      const items = [...prev.items];
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return prev;
      
      const [movedItem] = items.splice(itemIndex, 1);
      movedItem.position = newPosition;
      items.splice(newPosition, 0, movedItem);
      
      // Update positions for other items
      items.forEach((item, index) => {
        item.position = index;
      });

      return {
        ...prev,
        items
      };
    });
  };

  const getHierarchicalStructure = () => {
    const chapters = outlineStructure.items
      .filter(item => item.type === 'chapter')
      .sort((a, b) => a.position - b.position);
    
    return chapters.map(chapter => ({
      ...chapter,
      children: outlineStructure.items
        .filter(item => item.type === 'scene' && item.parentId === chapter.id)
        .sort((a, b) => a.position - b.position)
    }));
  };

  const getFilteredItems = () => {
    let items = outlineStructure.items;
    
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status === statusFilter);
    }
    
    return items.sort((a, b) => a.position - b.position);
  };

  return {
    outlineStructure,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    getHierarchicalStructure,
    getFilteredItems
  };
};
