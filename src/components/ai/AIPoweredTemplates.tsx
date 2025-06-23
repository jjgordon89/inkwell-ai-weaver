
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { TEMPLATES } from './templates/constants';
import TemplateCard from './templates/TemplateCard';
import { useTemplateGeneration } from './templates/useTemplateGeneration';

const AIPoweredTemplates: React.FC = () => {
  const { generateTemplate, isGenerating, selectedTemplate } = useTemplateGeneration();

  const handleGenerateTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      generateTemplate(template);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          AI-Powered Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isGenerating={isGenerating}
                selectedTemplate={selectedTemplate}
                onGenerate={handleGenerateTemplate}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AIPoweredTemplates;
