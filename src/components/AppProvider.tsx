import React, { ReactNode } from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { WritingProvider } from '@/contexts/WritingContext';
import { AISettingsProvider } from '@/contexts/AISettingsContext';
import { AIContextProvider } from '@/contexts/AIContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastProvider from '@/components/providers/ToastProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import TauriEventsProvider from '@/components/providers/TauriEventsProvider';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component consolidates all application context providers
 * and wraps the entire application in an ErrorBoundary.
 */
const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <TauriEventsProvider>
          <ToastProvider>
            <AIContextProvider>
              <AISettingsProvider>
                <ProjectProvider>
                  <WritingProvider>
                    {children}
                  </WritingProvider>
                </ProjectProvider>
              </AISettingsProvider>
            </AIContextProvider>
          </ToastProvider>
        </TauriEventsProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default AppProvider;
