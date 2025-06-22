
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, Grid3X3, List, Clock, Search, FileText, Upload, Download, MoreHorizontal } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentView } from '@/types/document';

interface ViewManagerProps {
  onViewChange?: (view: DocumentView) => void;
  onTemplateClick?: () => void;
  onImportClick?: () => void;
  onExportClick?: () => void;
}

const ViewManager = ({ onViewChange, onTemplateClick, onImportClick, onExportClick }: ViewManagerProps) => {
  const { state, dispatch } = useProject();

  const views: DocumentView[] = [
    { id: 'editor', name: 'Editor', type: 'editor' },
    { id: 'corkboard', name: 'Corkboard', type: 'corkboard' },
    { id: 'outline', name: 'Outline', type: 'outline' },
    { id: 'timeline', name: 'Timeline', type: 'timeline' },
    { id: 'research', name: 'Research', type: 'research' }
  ];

  const getViewIcon = (type: string) => {
    switch (type) {
      case 'editor': return Edit3;
      case 'corkboard': return Grid3X3;
      case 'outline': return List;
      case 'timeline': return Clock;
      case 'research': return Search;
      default: return Edit3;
    }
  };

  const handleViewChange = (viewId: string) => {
    const view = views.find(v => v.id === viewId);
    if (view) {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
      onViewChange?.(view);
    }
  };

  return (
    <div className="border-b bg-muted/30 px-4 py-2">
      <div className="flex items-center justify-between">
        <Tabs value={state.activeView.id} onValueChange={handleViewChange}>
          <TabsList className="bg-background">
            {views.map((view) => {
              const Icon = getViewIcon(view.type);
              return (
                <TabsTrigger 
                  key={view.id} 
                  value={view.id}
                  className="flex items-center gap-2 px-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{view.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onTemplateClick}>
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImportClick}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportClick}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ViewManager;
