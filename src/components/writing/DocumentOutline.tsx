import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, FileText, Folder } from 'lucide-react';

interface OutlineItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

interface DocumentOutlineProps {
  content: string;
  onNavigate?: (lineNumber: number) => void;
  className?: string;
}

const DocumentOutline: React.FC<DocumentOutlineProps> = ({
  content,
  onNavigate,
  className = ''
}) => {
  const outline = useMemo(() => {
    const lines = content.split('\n');
    const items: OutlineItem[] = [];
    
    lines.forEach((line, index) => {
      // Look for markdown-style headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        items.push({
          id: `header-${index}`,
          text: headerMatch[2].trim(),
          level: headerMatch[1].length,
          line: index + 1
        });
      }
      
      // Look for chapter/scene markers
      const chapterMatch = line.match(/^(Chapter|Scene|Part)\s+(.+)$/i);
      if (chapterMatch) {
        items.push({
          id: `chapter-${index}`,
          text: line.trim(),
          level: 1,
          line: index + 1
        });
      }
    });
    
    return items;
  }, [content]);

  const getIcon = (level: number) => {
    if (level === 1) return <Folder className="h-3 w-3" />;
    if (level <= 3) return <FileText className="h-3 w-3" />;
    return <Hash className="h-3 w-3" />;
  };

  const getIndentation = (level: number) => {
    return `ml-${Math.min(level - 1, 6) * 3}`;
  };

  if (outline.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Outline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No headings found. Add headers using # syntax to see the outline.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Document Outline
          <Badge variant="secondary" className="text-xs">
            {outline.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {outline.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-left h-auto py-1 px-2 ${getIndentation(item.level)}`}
            onClick={() => onNavigate?.(item.line)}
          >
            <div className="flex items-start gap-2 min-w-0">
              {getIcon(item.level)}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">
                  {item.text}
                </div>
                <div className="text-xs text-muted-foreground">
                  Line {item.line}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentOutline;
