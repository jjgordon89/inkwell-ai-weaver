
import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TimelineView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <h2 className="font-semibold">Timeline</h2>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Timeline View</h3>
            <p className="text-muted-foreground">
              Timeline functionality coming soon. Track story events and plot progression chronologically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimelineView;
