
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download } from 'lucide-react';
import type { Template } from './types';

interface TemplateCardProps {
  template: Template;
  isGenerating: boolean;
  selectedTemplate: string | null;
  onGenerate: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isGenerating,
  selectedTemplate,
  onGenerate
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="text-primary mt-0.5">
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">{template.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {template.description}
          </p>
          <Badge variant="outline" className="mt-2 text-xs">
            {template.type}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onGenerate(template.id)}
        disabled={isGenerating}
        className="h-8 px-3"
      >
        {isGenerating && selectedTemplate === template.id ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Download className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

export default TemplateCard;
