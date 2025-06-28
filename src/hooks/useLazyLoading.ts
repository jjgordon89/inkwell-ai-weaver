
import { lazy } from 'react';

export const useLazyLoading = () => {
  const LazyComponents = {
    CorkboardView: lazy(() => import('@/components/views/CorkboardView')),
    TimelineView: lazy(() => import('@/components/views/TimelineView')),
    ResearchView: lazy(() => import('@/components/views/ResearchView'))
  };

  return LazyComponents;
};
