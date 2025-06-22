
import { lazy } from 'react';

// Lazy load heavy components to improve initial load time
export const LazyComponents = {
  // View components
  CorkboardView: lazy(() => import('@/components/views/CorkboardView')),
  TimelineView: lazy(() => import('@/components/views/TimelineView')),
  ResearchView: lazy(() => import('@/components/views/ResearchView')),
  
  // Dialog components
  TemplateDialog: lazy(() => import('@/components/dialogs/TemplateDialog')),
  ImportDialog: lazy(() => import('@/components/dialogs/ImportDialog')),
  ExportDialog: lazy(() => import('@/components/dialogs/ExportDialog')),
  
  // AI components
  AIAssistance: lazy(() => import('@/components/sections/AIAssistance')),
  FloatingAISettings: lazy(() => import('@/components/ai/FloatingAISettings')),
  
  // Complex sections
  Characters: lazy(() => import('@/components/sections/Characters')),
  WorldBuilding: lazy(() => import('@/components/sections/WorldBuilding')),
  StoryArcs: lazy(() => import('@/components/sections/StoryArcs'))
};

export const useLazyLoading = () => {
  return LazyComponents;
};
