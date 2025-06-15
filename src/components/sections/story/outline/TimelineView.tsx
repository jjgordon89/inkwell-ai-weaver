
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit3, Trash2, FileText, BookOpen, Clock } from 'lucide-react';
import type { OutlineItem } from '@/hooks/outline/types';

interface TimelineViewProps {
  items: OutlineItem[];
  onUpdate: (itemId: string, updates: Partial<OutlineItem>) => void;
  onDelete: (itemId: string) => void;
  onEdit: (itemId: string) => void;
}

const TimelineView = ({ items, onUpdate, onDelete, onEdit }: TimelineViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'in-progress': return 'border-blue-500 bg-blue-50';
      case 'needs-revision': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'chapter' ? BookOpen : FileText;
  };

  const getTimelineConnectorColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'needs-revision': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {items.map((item, index) => {
          const Icon = getTypeIcon(item.type);
          
          return (
            <div key={item.id} className="relative flex items-start gap-6">
              {/* Timeline marker */}
              <div className="relative z-10 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border-2 border-background ${getTimelineConnectorColor(item.status)}`} />
              </div>

              {/* Content card */}
              <Card className={`flex-1 border-l-4 ${getStatusColor(item.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`h-5 w-5 mt-1 ${item.type === 'chapter' ? 'text-primary' : 'text-muted-foreground'}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}

                        {item.summary && item.summary !== item.description && (
                          <p className="text-sm text-foreground/80 italic mb-2">
                            {item.summary}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.updatedAt.toLocaleDateString()}
                          </div>
                          
                          {item.wordCount && (
                            <div>
                              {item.wordCount.toLocaleString()} words
                            </div>
                          )}

                          {item.estimatedWordCount && !item.wordCount && (
                            <div className="text-muted-foreground/70">
                              Est. {item.estimatedWordCount.toLocaleString()} words
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getStatusColor(item.status).replace('border-', 'bg-').replace('bg-', 'bg-') + ' text-white'}>
                        {item.status.replace('-', ' ')}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress indicator for chapters */}
                  {item.type === 'chapter' && item.estimatedWordCount && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>
                          {item.wordCount || 0} / {item.estimatedWordCount} words
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(((item.wordCount || 0) / item.estimatedWordCount) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
