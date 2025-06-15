
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

const MainLayout = () => {
  return (
    <WritingProvider>
      <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="p-6 pb-0">
              <Breadcrumb />
            </div>
            <div className="flex-1">
              <Editor />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <RightPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </WritingProvider>
  );
};

export default MainLayout;
