
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit3, Trash2, FileText, BookOpen } from 'lucide-react';
import type { OutlineItem } from '@/hooks/outline/types';

interface CorkboardViewProps {
  items: OutlineItem[];
  onUpdate: (itemId: string, updates: Partial<OutlineItem>) => void;
  onDelete: (itemId: string) => void;
  onMove: (itemId: string, newPosition: number) => void;
  onEdit: (itemId: string) => void;
}

const CorkboardView = ({ items, onUpdate, onDelete, onMove, onEdit }: CorkboardViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      case 'needs-revision': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'needs-revision': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'chapter' ? BookOpen : FileText;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = getTypeIcon(item.type);
        
        return (
          <Card
            key={item.id}
            className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer transform hover:-translate-y-1 ${getStatusColor(item.status)}`}
            style={{
              backgroundColor: item.color || undefined,
              minHeight: '200px'
            }}
          >
            {/* Status dot */}
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusDotColor(item.status)}`} />
            
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <Icon className={`h-5 w-5 mt-1 ${item.type === 'chapter' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {item.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-4 mb-3 flex-1">
                  {item.description}
                </p>
              )}

              {item.summary && item.summary !== item.description && (
                <p className="text-xs text-foreground/80 line-clamp-3 mb-3 flex-1 italic">
                  {item.summary}
                </p>
              )}

              <div className="mt-auto space-y-2">
                {/* Word count */}
                {item.wordCount && (
                  <div className="text-xs text-muted-foreground">
                    {item.wordCount.toLocaleString()} words
                  </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-current/10">
                  <div className="text-xs text-muted-foreground">
                    #{item.position + 1}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CorkboardView;
