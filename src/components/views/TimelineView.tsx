
import React from 'react';
import { Clock, Plus, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from '@/contexts/ProjectContext';

const TimelineView = () => {
  const { state } = useProject();

  // Get all documents sorted by creation date
  const timelineItems = state.flatDocuments
    .filter(doc => doc.type !== 'folder')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

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
      
      <div className="flex-1 p-6">
        {timelineItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Timeline Events</h3>
              <p className="text-muted-foreground mb-4">
                Your documents will appear here as timeline events.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative">
                {index < timelineItems.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                )}
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                  
                  <Card className="flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.synopsis && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.synopsis}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {item.wordCount?.toLocaleString() || 0} words • {item.type}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
