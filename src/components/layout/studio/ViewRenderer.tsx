
import React, { Suspense } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import EditorView from '../../views/EditorView';
import OutlineView from '../../views/OutlineView';

const ViewRenderer = () => {
  const { state } = useProject();
  const LazyComponents = useLazyLoading();

  const LoadingFallback = (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  switch (state.activeView.type) {
    case 'editor':
      return <EditorView />;
    case 'corkboard':
      return (
        <Suspense fallback={LoadingFallback}>
          <LazyComponents.CorkboardView />
        </Suspense>
      );
    case 'outline':
      return <OutlineView />;
    case 'timeline':
      return (
        <Suspense fallback={LoadingFallback}>
          <LazyComponents.TimelineView />
        </Suspense>
      );
    case 'research':
      return (
        <Suspense fallback={LoadingFallback}>
          <LazyComponents.ResearchView />
        </Suspense>
      );
    default:
      return <EditorView />;
  }
};

export default ViewRenderer;
