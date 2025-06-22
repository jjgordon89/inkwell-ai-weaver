
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorldElement } from '@/contexts/WritingContext';

interface WorldElementItemProps {
  element: WorldElement;
  onEdit: (element: WorldElement) => void;
  onDelete: (id: string) => void;
  getTypeColor: (type: WorldElement['type']) => string;
}

const WorldElementItem: React.FC<WorldElementItemProps> = ({
  element,
  onEdit,
  onDelete,
  getTypeColor
}) => {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{element.name}</CardTitle>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(element.type)}`}>
              {element.type}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={() => onEdit(element)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDelete(element.id)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {element.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {element.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default WorldElementItem;
