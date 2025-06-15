
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { WritingProvider } from "@/contexts/WritingContext";
import { AIProvider } from "@/contexts/AIContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WritingProvider>
          <AIProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AIProvider>
        </WritingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
