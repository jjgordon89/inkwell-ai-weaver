
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Film, Search, FileText, Loader2 } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import type { DocumentTemplate } from '@/types/templates';
import type { UnifiedProjectTemplate } from '@/types/unified-templates';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TemplateDialog = ({ open, onOpenChange }: TemplateDialogProps) => {
  const { defaultTemplates, isLoading, applyTemplate } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'novel': return BookOpen;
      case 'screenplay': return Film;
      case 'research': return Search;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'novel': return 'bg-blue-100 text-blue-800';
      case 'screenplay': return 'bg-purple-100 text-purple-800';
      case 'research': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate) {
      await applyTemplate(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  const templatesByCategory = defaultTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DocumentTemplate[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start your project with a professional template structure
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="novel">Novel</TabsTrigger>
            <TabsTrigger value="screenplay">Screenplay</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultTemplates.map((template) => {
                const Icon = getTemplateIcon(template.category);
                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{template.structure.length} sections</span>
                        <span>
                          {template.metadata?.wordCountTarget?.toLocaleString()} words target
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => {
                  const Icon = getTemplateIcon(template.category);
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{template.structure.length} sections</span>
                          <span>
                            {template.metadata?.wordCountTarget?.toLocaleString()} words target
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedTemplate && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground">
                  This will replace your current project structure
                </p>
              </div>
              <Button 
                onClick={handleApplyTemplate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Template'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
