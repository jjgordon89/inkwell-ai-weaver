
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DocumentBinder from '../DocumentBinder';
import { BinderProvider } from '../binder/BinderContext';
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentView } from '@/types/document';

interface MobileStudioLayoutProps {
  renderActiveView: () => React.ReactNode;
  onViewChange: (view: DocumentView) => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
}

const MobileStudioLayout = ({ renderActiveView }: MobileStudioLayoutProps) => {
  const { state, dispatch } = useProject();
  const [isBinderOpen, setIsBinderOpen] = useState(false);

  const handleNodeSelect = (nodeId: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: nodeId });
    setIsBinderOpen(false); // Close binder on mobile after selection
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
    console.log('Edit node:', node);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Sheet open={isBinderOpen} onOpenChange={setIsBinderOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <BinderProvider
              initialSelectedNodeId={state.activeDocumentId || undefined}
              onNodeSelect={handleNodeSelect}
              onNodeDelete={handleNodeDelete}
              onNodeAdd={handleNodeAdd}
              onNodeEdit={handleNodeEdit}
            >
              <DocumentBinder />
            </BinderProvider>
          </SheetContent>
        </Sheet>
        
        <h1 className="font-semibold">Writing Studio</h1>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default MobileStudioLayout;
