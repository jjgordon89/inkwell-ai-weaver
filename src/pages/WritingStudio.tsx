
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';
import DocumentTree from '@/components/DocumentTree';
import DocumentEditor from '@/components/DocumentEditor';
import StoryArcs from '@/components/sections/StoryArcs';
import Characters from '@/components/sections/Characters';
import WorldBuilding from '@/components/sections/WorldBuilding';
import AITextProcessor from '@/components/sections/story/AITextProcessor';
import EnhancedAIPanel from '@/components/sections/story/EnhancedAIPanel';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  FileText,
  FolderPlus,
  Save,
  Undo,
  Redo,
  Search,
  Filter,
  LayoutDashboard,
  BookOpenCheck,
  Users,
  Globe,
  Brain,
  Calendar as CalendarIcon
} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import QuickAISettings from '@/components/ai/QuickAISettings';
import FloatingAISettings from '@/components/ai/FloatingAISettings';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const WritingStudio = () => {
  const { state: writingState, dispatch: writingDispatch } = useWriting();
  const { state: projectState, dispatch: projectDispatch } = useProject();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAISection, setShowAISection] = useState(true);

  useEffect(() => {
    if (projectState.currentProject?.id && !projectState.activeDocumentId) {
      // Load the manuscript root document if no document is selected
      const manuscriptRoot = projectState.flatDocuments.find(doc => doc.id === 'manuscript-root');
      if (manuscriptRoot) {
        projectDispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: manuscriptRoot.id });
      }
    }
  }, [projectState.currentProject?.id, projectState.flatDocuments, projectState.activeDocumentId, projectDispatch]);

  const handleCreateDocument = () => {
    if (!projectState.currentProject) return;

    const newDocument = {
      id: uuidv4(),
      projectId: projectState.currentProject.id,
      parentId: 'manuscript-root',
      title: 'New Document',
      type: 'document' as const,
      content: '',
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'not-started' as const
    };

    projectDispatch({ type: 'ADD_DOCUMENT', payload: newDocument });
    toast({
      title: "Document Created",
      description: "Your new document has been created.",
    })
  };

  const handleCreateFolder = () => {
    if (!projectState.currentProject) return;

    const newFolder = {
      id: uuidv4(),
      projectId: projectState.currentProject.id,
      parentId: 'manuscript-root',
      title: 'New Folder',
      type: 'folder' as const,
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'not-started' as const
    };

    projectDispatch({ type: 'ADD_DOCUMENT', payload: newFolder });
    toast({
      title: "Folder Created",
      description: "Your new folder has been created.",
    })
  };

  const handleSave = async () => {
    const activeDocument = projectState.flatDocuments.find(
      doc => doc.id === projectState.activeDocumentId
    );
    
    if (!activeDocument) return;

    setIsSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));

    projectDispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        id: activeDocument.id,
        updates: {
          lastModified: new Date()
        }
      }
    });

    setIsSaving(false);
    toast({
      title: "Document Saved",
      description: "Your document has been saved.",
    })
  };

  const activeDocument = projectState.flatDocuments.find(
    doc => doc.id === projectState.activeDocumentId
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
            <LayoutDashboard className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Writing Studio</h1>
        </div>

        <div className="flex items-center gap-2">
          <QuickAISettings />
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsCommandOpen(true)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Open command menu</span>
          </Button>
        </div>
      </div>

      {/* Command Dialog */}
      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => {
                  setIsCommandOpen(false)
                  handleCreateDocument()
                }}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Document
                </CommandItem>
                <CommandItem onSelect={() => {
                  setIsCommandOpen(false)
                  handleCreateFolder()
                }}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Folder
                </CommandItem>
                <CommandItem onSelect={() => {
                  setIsCommandOpen(false)
                  handleSave()
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendar
                  <CommandShortcut>Ctrl+Shift+C</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Users className="mr-2 h-4 w-4" />
                  Team
                  <CommandShortcut>Ctrl+Shift+T</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <div className="flex h-full">
        {/* Sidebar */}
        <aside className={cn(
          "w-80 border-r flex-none h-full transition-all duration-300 ease-in-out",
          showSidebar ? "block" : "hidden"
        )}>
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Project Documents</h2>
            <DocumentTree />
            <Button variant="secondary" className="w-full justify-start" onClick={handleCreateDocument}>
              <FileText className="w-4 h-4 mr-2" />
              Add Document
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={handleCreateFolder}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Add Folder
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 h-full flex flex-col">
          {activeDocument ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{activeDocument.title}</h2>
              </div>
              <div className="flex-1 relative">
                <DocumentEditor />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-muted-foreground mb-2">Select a Document or Create New</h2>
                <p className="text-muted-foreground">Choose a document from the sidebar to start writing.</p>
              </div>
            </div>
          )}
        </main>

        {/* AI Assistant Section */}
        <aside className={cn(
          "w-80 border-l flex-none h-full transition-all duration-300 ease-in-out",
          showAISection ? "block" : "hidden"
        )}>
          <div className="p-4 space-y-4">
            <EnhancedAIPanel />
            <AITextProcessor />
          </div>
        </aside>
      </div>
      
      {/* Floating AI Settings Button */}
      <FloatingAISettings 
        position="bottom-right" 
        showOnlyWhenNotConfigured={false}
      />
    </div>
  );
};

export default WritingStudio;
