import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { WritingProvider } from '@/contexts/WritingContext';
import { AIProvider } from '@/contexts/AIContext';
import HomePage from '@/pages/HomePage';
import ProjectsPage from '@/pages/ProjectsPage';
import NewProjectPage from '@/pages/NewProjectPage';
import WritingStudio from '@/pages/WritingStudio';
import { useDatabase } from '@/hooks/useDatabase';

const AppContent = () => {
  const { isLoading, error } = useDatabase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Settings Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/studio" element={<WritingStudio />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

function App() {
  return (
    <AIProvider>
      <ProjectProvider>
        <WritingProvider>
          <AppContent />
        </WritingProvider>
      </ProjectProvider>
    </AIProvider>
  );
}

export default App;
