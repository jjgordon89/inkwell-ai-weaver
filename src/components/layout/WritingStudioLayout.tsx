
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileStudioLayout from './studio/MobileStudioLayout';
import DesktopStudioLayout from './studio/DesktopStudioLayout';
import ViewRenderer from './studio/ViewRenderer';
import type { DocumentView } from '@/types/document';

const WritingStudioLayout = () => {
  const { shortcuts } = useKeyboardShortcuts();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const isMobile = useIsMobile();

  const handleViewChange = (view: DocumentView) => {
    console.log('View changed to:', view.type);
  };

  const renderActiveView = () => <ViewRenderer />;

  if (isMobile) {
    return (
      <MobileStudioLayout
        renderActiveView={renderActiveView}
        onViewChange={handleViewChange}
        showOnboarding={showOnboarding}
        completeOnboarding={completeOnboarding}
      />
    );
  }

  return (
    <DesktopStudioLayout
      renderActiveView={renderActiveView}
      onViewChange={handleViewChange}
      showOnboarding={showOnboarding}
      completeOnboarding={completeOnboarding}
    />
  );
};

export default WritingStudioLayout;
