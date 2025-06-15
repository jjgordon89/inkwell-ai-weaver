
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronDown, Edit3, Trash2, GripVertical, FileText, BookOpen } from 'lucide-react';
import type { OutlineItem } from '@/hooks/outline/types';

interface HierarchyViewProps {
  structure: (OutlineItem & { children?: OutlineItem[] })[];
  onUpdate: (itemId: string, updates: Partial<OutlineItem>) => void;
  onDelete: (itemId: string) => void;
  onMove: (itemId: string, newPosition: number) => void;
  onEdit: (itemId: string) => void;
}

const HierarchyView = ({ structure, onUpdate, onDelete, onMove, onEdit }: HierarchyViewProps) => {
  const [expandedChapters, setExpandedChapters] = React.useState<Set<string>>(new Set());

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'needs-revision': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'needs-revision': return 'Needs Revision';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {structure.map((chapter) => (
        <Card key={chapter.id} className="border-l-4 border-l-primary/30">
          <CardContent className="p-4">
            {/* Chapter Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleChapter(chapter.id)}
                  className="p-1 h-6 w-6"
                >
                  {expandedChapters.has(chapter.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                <BookOpen className="h-5 w-5 text-primary" />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(chapter.status)}>
                  {getStatusText(chapter.status)}
                </Badge>
                
                {chapter.wordCount && (
                  <Badge variant="outline">
                    {chapter.wordCount.toLocaleString()} words
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(chapter.id)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(chapter.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chapter Scenes */}
            {expandedChapters.has(chapter.id) && chapter.children && (
              <div className="ml-8 space-y-2 border-l border-muted pl-4">
                {chapter.children.map((scene) => (
                  <div
                    key={scene.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{scene.title}</h4>
                        {scene.description && (
                          <p className="text-sm text-muted-foreground">
                            {scene.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(scene.status)} variant="outline">
                        {getStatusText(scene.status)}
                      </Badge>
                      
                      {scene.wordCount && (
                        <Badge variant="outline">
                          {scene.wordCount.toLocaleString()}w
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(scene.id)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(scene.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HierarchyView;
