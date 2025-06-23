
import { useState } from 'react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from '@/hooks/use-toast';
import { generateTemplatePrompt, formatTemplateContent } from './templateUtils';
import type { Template } from './types';

export const useTemplateGeneration = () => {
  const { generateContextualSuggestions } = useCollaborativeAI();
  const { state, dispatch } = useWriting();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const generateTemplate = async (template: Template) => {
    if (!state.currentDocument) return;

    setIsGenerating(true);
    setSelectedTemplate(template.id);

    try {
      const suggestions = await generateContextualSuggestions(
        state.currentDocument.content || '',
        undefined,
        state.characters.map(c => c.name),
        state.storyArcs
      );

      const templateContent = suggestions.length > 0 
        ? suggestions[0] 
        : `Generated ${template.title} template content would appear here.`;

      const formattedContent = formatTemplateContent(template, templateContent);
      const newContent = (state.currentDocument.content || '') + formattedContent;
      
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

  return {
    generateTemplate,
    isGenerating,
    selectedTemplate
  };
};
