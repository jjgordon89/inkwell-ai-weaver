
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectProvider } from '@/contexts/ProjectContext';
import { WritingProvider } from '@/contexts/WritingContext';
import { AIContextProvider } from '@/contexts/AIContext';
import { AISettingsProvider } from '@/contexts/AISettingsContext';

import LandingPage from '@/pages/LandingPage';
import Projects from '@/pages/Projects';
import WritingStudio from '@/pages/WritingStudio';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import NewProjectPage from '@/pages/NewProjectPage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProjectProvider>
          <WritingProvider>
            <AIContextProvider>
              <AISettingsProvider>
                <Router>
                  <div className="min-h-screen bg-background text-foreground">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/new" element={<NewProjectPage />} />
                      <Route path="/studio" element={<WritingStudio />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                  </div>
                </Router>
              </AISettingsProvider>
            </AIContextProvider>
          </WritingProvider>
        </ProjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
