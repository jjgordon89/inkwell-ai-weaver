
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
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-6 border-b bg-background flex-shrink-0">
        <h1 className="text-lg font-semibold">Manuscript</h1>
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="flex-shrink-0">
        <ViewManager onViewChange={onViewChange} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Document Binder */}
          <ResizablePanel 
            defaultSize={20} 
            minSize={15} 
            maxSize={35}
            data-tour="binder"
            className="overflow-hidden"
          >
            <DocumentBinder />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Main Content Area */}
          <ResizablePanel defaultSize={60} data-tour="editor" className="overflow-hidden">
            <div className="h-full overflow-hidden" data-tour="views">
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
            className="overflow-hidden"
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
