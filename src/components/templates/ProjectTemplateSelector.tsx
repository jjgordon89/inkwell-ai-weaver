import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Film, GraduationCap, Sparkles, Check } from 'lucide-react';
import { UnifiedProjectTemplate } from '@/types/unified-templates';
import { PROJECT_TEMPLATES } from '@/types/templates';

interface ProjectTemplateSelectorProps {
  selectedTemplate: UnifiedProjectTemplate | null;
  onTemplateSelect: (template: UnifiedProjectTemplate) => void;
  className?: string;
}

const STRUCTURE_ICONS = {
  novel: BookOpen,
  screenplay: Film,
  research: GraduationCap,
  poetry: Sparkles,
};

const STRUCTURE_LABELS = {
  novel: 'Novels',
  screenplay: 'Screenplays',
  research: 'Research',
  poetry: 'Poetry',
};

const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'novel' | 'screenplay' | 'research' | 'poetry'>('all');

  const filteredTemplates = activeTab === 'all' 
    ? PROJECT_TEMPLATES 
    : PROJECT_TEMPLATES.filter(template => template.structure === activeTab);

  const groupedTemplates = PROJECT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.structure]) {
      acc[template.structure] = [];
    }
    acc[template.structure].push(template);
    return acc;
  }, {} as Record<string, UnifiedProjectTemplate[]>);

  const renderTemplateCard = (template: UnifiedProjectTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;
    
    return (
      <Card 
        key={template.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-primary border-primary' 
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => onTemplateSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </div>
            </div>
            {isSelected && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Features */}
            <div>
              <p className="text-sm font-medium mb-2">Features included:</p>
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Default settings */}
            <div className="text-xs text-muted-foreground space-y-1">
              {template.defaultSettings.wordCountTarget && (
                <div>Target: {template.defaultSettings.wordCountTarget.toLocaleString()} words</div>
              )}
              {template.defaultSettings.chapterCount && (
                <div>Chapters: {template.defaultSettings.chapterCount}</div>
              )}
              {template.defaultSettings.genre && (
                <div>Genre: {template.defaultSettings.genre}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(STRUCTURE_LABELS).map(([key, label]) => {
            const Icon = STRUCTURE_ICONS[key as keyof typeof STRUCTURE_ICONS];
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([structure, templates]) => {
              const Icon = STRUCTURE_ICONS[structure as keyof typeof STRUCTURE_ICONS];
              const label = STRUCTURE_LABELS[structure as keyof typeof STRUCTURE_LABELS];
              
              return (
                <div key={structure}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{label}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {templates.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(renderTemplateCard)}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {(['novel', 'screenplay', 'research', 'poetry'] as const).map((structure) => (
          <TabsContent key={structure} value={structure} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Template: {selectedTemplate.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {selectedTemplate.description}
          </p>
          
          {selectedTemplate.sampleContent && (
            <div className="text-sm">
              <p className="font-medium mb-1">This template includes:</p>
              <ul className="text-muted-foreground space-y-1">
                {selectedTemplate.sampleContent.chapters && (
                  <li>• Sample chapters and structure</li>
                )}
                {selectedTemplate.sampleContent.characters && (
                  <li>• Character templates</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectTemplateSelector;
