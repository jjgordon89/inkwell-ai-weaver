
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import DocumentBinder from './DocumentBinder';
import InspectorPanel from './InspectorPanel';
import ViewManager from './ViewManager';
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentView } from '@/types/document';

// Import view components
import EditorView from '../views/EditorView';
import CorkboardView from '../views/CorkboardView';
import OutlineView from '../views/OutlineView';
import TimelineView from '../views/TimelineView';
import ResearchView from '../views/ResearchView';

const WritingStudioLayout = () => {
  const { state } = useProject();

  const renderActiveView = () => {
    switch (state.activeView.type) {
      case 'editor':
        return <EditorView />;
      case 'corkboard':
        return <CorkboardView />;
      case 'outline':
        return <OutlineView />;
      case 'timeline':
        return <TimelineView />;
      case 'research':
        return <ResearchView />;
      default:
        return <EditorView />;
    }
  };

  const handleViewChange = (view: DocumentView) => {
    console.log('View changed to:', view.type);
  };

  return (
    <div className="h-screen flex flex-col">
      <ViewManager onViewChange={handleViewChange} />
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Document Binder */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <DocumentBinder />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Main Content Area */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full">
              {renderActiveView()}
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Inspector Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <InspectorPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WritingStudioLayout;
