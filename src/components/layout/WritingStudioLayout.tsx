
import React, { useState, Suspense } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import DocumentBinder from './DocumentBinder';
import InspectorPanel from './InspectorPanel';
import ViewManager from './ViewManager';
import { useProject } from '@/contexts/ProjectContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useIsMobile } from '@/hooks/use-mobile';
import AccessibilityMenu from '@/components/accessibility/AccessibilityMenu';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import type { DocumentView } from '@/types/document';

// Import view components
import EditorView from '../views/EditorView';

const WritingStudioLayout = () => {
  const { state } = useProject();
  const { shortcuts } = useKeyboardShortcuts();
  const LazyComponents = useLazyLoading();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const isMobile = useIsMobile();

  const renderActiveView = () => {
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

  const handleViewChange = (view: DocumentView) => {
    console.log('View changed to:', view.type);
  };

  // Mobile layout - stack panels vertically
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b">
          <ViewManager onViewChange={handleViewChange} />
          <AccessibilityMenu />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {renderActiveView()}
        </div>
        
        {showOnboarding && (
          <OnboardingTour onComplete={completeOnboarding} />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <ViewManager onViewChange={handleViewChange} />
        <AccessibilityMenu />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Document Binder */}
          <ResizablePanel 
            defaultSize={20} 
            minSize={15} 
            maxSize={35}
            data-tour="binder"
          >
            <DocumentBinder />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Main Content Area */}
          <ResizablePanel defaultSize={60} data-tour="editor">
            <div className="h-full" data-tour="views">
              {renderActiveView()}
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Inspector Panel */}
          <ResizablePanel 
            defaultSize={20} 
            minSize={15} 
            maxSize={30}
            data-tour="inspector"
          >
            <InspectorPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
    </div>
  );
};

export default WritingStudioLayout;
