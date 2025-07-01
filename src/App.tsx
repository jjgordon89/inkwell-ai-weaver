import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Settings from '@/pages/Settings';
import Projects from '@/pages/Projects';
import NewProjectPage from '@/pages/NewProjectPage';
import ProjectView from '@/pages/ProjectView';
import WritingStudio from '@/pages/WritingStudio';
import AppProvider from '@/components/AppProvider';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <div className="app">
            <Routes>
              {/* Redirect root to projects page */}
              <Route path="/" element={<Navigate to="/projects" replace />} />
              
              {/* Projects routes */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<NewProjectPage />} />
              <Route path="/projects/:projectId" element={<ProjectView />} />
              
              {/* Writing Studio routes */}
              <Route path="/studio" element={<Navigate to="/projects" replace />} />
              <Route path="/studio/:projectId" element={<WritingStudio />} />
              
              {/* Other routes */}
              <Route path="/settings" element={<Settings />} />
              
              {/* Handle unknown routes by redirecting to Projects */}
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
          </div>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
