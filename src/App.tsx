import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import WritingStudioLayout from '@/components/layout/WritingStudioLayout';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { WritingProvider } from '@/contexts/WritingContext';
import { AISettingsProvider } from '@/contexts/AISettingsContext';
import { AIContextProvider } from '@/contexts/AIContext';

function App() {
  return (
    <BrowserRouter>
      <AIContextProvider>
        <AISettingsProvider>
          <ProjectProvider>
            <WritingProvider>
              <div className="app">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/studio" element={<WritingStudioLayout />} />
                </Routes>
              </div>
            </WritingProvider>
          </ProjectProvider>
        </AISettingsProvider>
      </AIContextProvider>
    </BrowserRouter>
  );
}

export default App;
