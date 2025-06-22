
import React from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ResearchView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <h2 className="font-semibold">Research</h2>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Research Hub</h3>
            <p className="text-muted-foreground">
              Research functionality coming soon. Organize your references, character notes, and world-building materials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResearchView;
