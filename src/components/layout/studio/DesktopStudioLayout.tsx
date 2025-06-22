
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import DocumentBinder from '../DocumentBinder';
import InspectorPanel from '../InspectorPanel';
import ViewManager from '../ViewManager';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import FloatingAISettings from '@/components/ai/FloatingAISettings';
import type { DocumentView } from '@/types/document';

interface DesktopStudioLayoutProps {
  renderActiveView: () => React.ReactNode;
  onViewChange: (view: DocumentView) => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
}

const DesktopStudioLayout = ({ 
  renderActiveView, 
  onViewChange, 
  showOnboarding, 
  completeOnboarding 
}: DesktopStudioLayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-6 border-b bg-background">
        <h1 className="text-lg font-semibold">Manuscript</h1>
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <ViewManager onViewChange={onViewChange} />
      
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
      
      {/* Floating AI Settings */}
      <FloatingAISettings 
        position="bottom-right"
        showOnlyWhenNotConfigured={false}
      />
      
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
    </div>
  );
};

export default DesktopStudioLayout;
