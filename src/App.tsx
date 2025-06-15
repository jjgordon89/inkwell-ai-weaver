
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { WritingProvider } from "@/contexts/WritingContext";
import { AIContextProvider } from "@/contexts/AIContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WritingProvider>
          <AIContextProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AIContextProvider>
        </WritingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
