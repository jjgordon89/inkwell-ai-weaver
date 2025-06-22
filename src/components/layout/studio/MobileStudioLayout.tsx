
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import ViewManager from '../ViewManager';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import type { DocumentView } from '@/types/document';

interface MobileStudioLayoutProps {
  renderActiveView: () => React.ReactNode;
  onViewChange: (view: DocumentView) => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
}

const MobileStudioLayout = ({ 
  renderActiveView, 
  onViewChange, 
  showOnboarding, 
  completeOnboarding 
}: MobileStudioLayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b bg-background">
        <h1 className="text-lg font-semibold">Manuscript</h1>
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <ViewManager onViewChange={onViewChange} />
      
      <div className="flex-1 overflow-hidden">
        {renderActiveView()}
      </div>
      
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
    </div>
  );
};

export default MobileStudioLayout;
