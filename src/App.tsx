
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { ProjectProvider } from '@/contexts/ProjectContext';
import LandingPage from '@/pages/LandingPage';
import Projects from '@/pages/Projects';
import NewProjectPage from '@/pages/NewProjectPage';
import WritingStudio from '@/pages/WritingStudio';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <div className="min-h-screen bg-background">
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
    </ProjectProvider>
  );
}

export default App;
