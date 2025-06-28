
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Folder } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TemplateDialog = ({ open, onOpenChange }: TemplateDialogProps) => {
  const { templates, applyTemplate, isLoading } = useDocumentTemplates();

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate(templateId);
    onOpenChange(false);
  };

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'novel':
        return <BookOpen className="h-5 w-5" />;
      case 'folder':
        return <Folder className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {getTemplateIcon(template.id)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Template
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApplyTemplate(template.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Applying...' : 'Apply Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
