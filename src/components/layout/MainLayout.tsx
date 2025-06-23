
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import RightPanel from "@/components/RightPanel";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { WritingProvider } from "@/contexts/WritingContext";
import { AISettingsProvider } from "@/contexts/AISettingsContext";
import FloatingAISettings from "@/components/ai/FloatingAISettings";

const MainLayout = () => {
  return (
    <AISettingsProvider>
      <WritingProvider>
        <div className="min-h-screen w-full overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="overflow-hidden">
              <Sidebar />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={30} className="overflow-hidden">
              <div className="h-full flex flex-col overflow-hidden">
                <div className="p-6 pb-0 flex-shrink-0">
                  <Breadcrumb />
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35} className="overflow-hidden">
              <RightPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Floating AI Settings Button */}
        <FloatingAISettings 
          position="bottom-right" 
          showOnlyWhenNotConfigured={true} 
        />
      </WritingProvider>
    </AISettingsProvider>
  );
};

export default MainLayout;
