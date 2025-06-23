
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  User, 
  Map, 
  BookOpen,
  Loader2,
  Download 
} from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  title: string;
  type: 'outline' | 'character' | 'scene' | 'world';
  description: string;
  icon: React.ReactNode;
}

const AIPoweredTemplates: React.FC = () => {
  const { generateContextualSuggestions } = useCollaborativeAI();
  const { state, dispatch } = useWriting();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: 'story-outline',
      title: 'Story Outline',
      type: 'outline',
      description: 'Generate a comprehensive story structure with plot points',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: 'character-profile',
      title: 'Character Profile',
      type: 'character',
      description: 'Create detailed character backgrounds and personalities',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'scene-structure',
      title: 'Scene Structure',
      type: 'scene',
      description: 'Build engaging scenes with conflict and resolution',
      icon: <Map className="h-4 w-4" />
    },
    {
      id: 'world-building',
      title: 'World Building',
      type: 'world',
      description: 'Develop rich settings and environments',
      icon: <FileText className="h-4 w-4" />
    }
  ];

  const generateTemplate = async (templateId: string) => {
    if (!state.currentDocument) return;

    setIsGenerating(true);
    setSelectedTemplate(templateId);

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      let prompt = '';
      switch (template.type) {
        case 'outline':
          prompt = `Generate a detailed story outline with:
- Three-act structure
- Key plot points
- Character arcs
- Conflict progression
Based on the current content: "${state.currentDocument.content?.substring(0, 500) || 'New story'}"`;
          break;
        case 'character':
          prompt = `Create a comprehensive character profile including:
- Background and history
- Personality traits
- Motivations and goals
- Relationships
- Character arc
Based on story context: "${state.currentDocument.content?.substring(0, 300) || 'New character'}"`;
          break;
        case 'scene':
          prompt = `Design a scene structure with:
- Setting and atmosphere
- Character goals and obstacles
- Conflict and tension
- Resolution or cliffhanger
Based on story: "${state.currentDocument.content?.substring(0, 300) || 'New scene'}"`;
          break;
        case 'world':
          prompt = `Develop world building elements:
- Setting description
- Cultural elements
- Rules and systems
- Historical background
Based on story world: "${state.currentDocument.content?.substring(0, 300) || 'New world'}"`;
          break;
      }

      const suggestions = await generateContextualSuggestions(
        state.currentDocument.content || '',
        undefined,
        state.characters,
        state.storyArcs
      );

      // For now, we'll use the first suggestion as our template content
      const templateContent = suggestions.length > 0 ? suggestions[0] : `Generated ${template.title} template content would appear here.`;

      // Add the template to the document
      const newContent = (state.currentDocument.content || '') + '\n\n--- ' + template.title + ' ---\n' + templateContent;
      
      dispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: state.currentDocument.id,
          content: newContent
        }
      });

      toast({
        title: "Template Generated",
        description: `${template.title} has been added to your document`
      });

    } catch (error) {
      console.error('Template generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate template",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setSelectedTemplate(null);
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
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
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
                  onClick={() => generateTemplate(template.id)}
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
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AIPoweredTemplates;
