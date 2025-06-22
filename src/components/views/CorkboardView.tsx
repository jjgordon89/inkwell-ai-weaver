
import React from 'react';
import { Grid3X3, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from '@/contexts/ProjectContext';

const CorkboardView = () => {
  const { state } = useProject();
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <h2 className="font-semibold">Corkboard</h2>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Scene
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="text-center text-muted-foreground">
          <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Corkboard View</h3>
          <p>Visual scene management coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
};

export default CorkboardView;
