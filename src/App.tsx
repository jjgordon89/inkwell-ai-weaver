
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import WritingStudio from "./pages/WritingStudio";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { WritingProvider } from "@/contexts/WritingContext";
import { AIContextProvider } from "@/contexts/AIContext";
import { AISettingsProvider } from "@/contexts/AISettingsContext";
import AISettingsDialog from "@/components/dialogs/AISettingsDialog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AIContextProvider>
        <AISettingsProvider>
          <ProjectProvider>
            <WritingProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/studio" element={<WritingStudio />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <AISettingsDialog />
              </BrowserRouter>
            </WritingProvider>
          </ProjectProvider>
        </AISettingsProvider>
      </AIContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
