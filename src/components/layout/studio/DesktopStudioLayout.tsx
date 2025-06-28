
import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import DocumentBinder from '../DocumentBinder';
import { BinderProvider } from '../binder/BinderContext';
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentView } from '@/types/document';

interface DesktopStudioLayoutProps {
  renderActiveView: () => React.ReactNode;
  onViewChange: (view: DocumentView) => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
}

const DesktopStudioLayout = ({ renderActiveView }: DesktopStudioLayoutProps) => {
  const { state, dispatch } = useProject();

  const handleNodeSelect = (nodeId: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: nodeId });
  };

  const handleNodeDelete = (nodeId: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: nodeId });
  };

  const handleNodeAdd = (parentId: string) => {
    const newDoc = {
      id: crypto.randomUUID(),
      title: 'New Document',
      type: 'document' as const,
      parentId,
      status: 'not-started' as const,
      wordCount: 0,
      labels: [],
      createdAt: new Date(),
      lastModified: new Date(),
      position: 0
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
  };

  const handleNodeEdit = (node: any) => {
    // Handle node editing - could open a dialog or inline edit
    console.log('Edit node:', node);
  };

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <BinderProvider
            initialSelectedNodeId={state.activeDocumentId || undefined}
            onNodeSelect={handleNodeSelect}
            onNodeDelete={handleNodeDelete}
            onNodeAdd={handleNodeAdd}
            onNodeEdit={handleNodeEdit}
          >
            <DocumentBinder />
          </BinderProvider>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={75} minSize={50}>
          {renderActiveView()}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DesktopStudioLayout;
