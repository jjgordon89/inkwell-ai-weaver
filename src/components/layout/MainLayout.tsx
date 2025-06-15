
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import RightPanel from "@/components/RightPanel";

const MainLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55} minSize={30}>
        <Editor />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <RightPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default MainLayout;
