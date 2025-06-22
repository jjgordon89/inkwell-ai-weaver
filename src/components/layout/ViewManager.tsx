
import React from 'react';
import { FileText, Grid3X3, List, Calendar, Search, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from '@/contexts/ProjectContext';
import type { DocumentView } from '@/types/document';

const viewTypes = [
  { id: 'editor', name: 'Editor', icon: FileText, description: 'Write and edit documents' },
  { id: 'corkboard', name: 'Corkboard', icon: Grid3X3, description: 'Visual overview of scenes' },
  { id: 'outline', name: 'Outline', icon: List, description: 'Hierarchical document structure' },
  { id: 'timeline', name: 'Timeline', icon: Calendar, description: 'Chronological view' },
  { id: 'research', name: 'Research', icon: Search, description: 'Research materials and notes' }
];

interface ViewManagerProps {
  onViewChange?: (view: DocumentView) => void;
}

const ViewManager = ({ onViewChange }: ViewManagerProps) => {
  const { state, dispatch } = useProject();

  const handleViewChange = (viewId: string) => {
    const viewType = viewTypes.find(v => v.id === viewId);
    if (!viewType) return;

    const newView: DocumentView = {
      id: crypto.randomUUID(),
      name: viewType.name,
      type: viewType.id as DocumentView['type'],
      activeDocumentId: state.activeDocumentId || undefined
    };

    dispatch({ type: 'SET_ACTIVE_VIEW', payload: newView });
    onViewChange?.(newView);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">View:</span>
      </div>
      
      <ToggleGroup 
        type="single" 
        value={state.activeView.type}
        onValueChange={handleViewChange}
        className="gap-1"
      >
        {viewTypes.map((view) => {
          const Icon = view.icon;
          return (
            <ToggleGroupItem
              key={view.id}
              value={view.id}
              aria-label={view.description}
              className="px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{view.name}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <div className="ml-auto text-sm text-muted-foreground">
        {state.activeView.name}
        {state.activeDocumentId && ` • ${state.flatDocuments.find(d => d.id === state.activeDocumentId)?.title || 'Untitled'}`}
      </div>
    </div>
  );
};

export default ViewManager;
