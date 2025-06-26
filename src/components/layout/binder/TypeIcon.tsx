import React from 'react';
import { FileText, Folder, BookOpen } from 'lucide-react';

interface TypeIconProps {
  type: string;
}

export const TypeIcon: React.FC<TypeIconProps> = React.memo(({ type }) => {
  switch (type) {
    case 'folder': return <Folder className="h-4 w-4 text-blue-500" />;
    case 'chapter': return <BookOpen className="h-4 w-4 text-primary" />;
    case 'scene': return <FileText className="h-4 w-4 text-muted-foreground" />;
    default: return <FileText className="h-4 w-4" />;
  }
});

TypeIcon.displayName = 'TypeIcon';